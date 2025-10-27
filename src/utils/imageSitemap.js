import { BASE_URL } from "@/utils/constants";
import { LOCALES } from "@/i18n/routing";
import fetchAllProductsForSitemap from "@/services/products/fetchAllProductsForSitemap";
import { isValidVideoExtension } from "@/utils/helpers";
import {
  MAX_URLS_PER_SITEMAP,
  generateImageSitemapXML,
  getCachedData,
  setCachedData,
  clearCache,
} from "@/utils/sitemap-utils";

export const IMAGE_SITEMAP_CACHE_KEY = "sitemap-images-global";
export const MAX_IMAGE_SITEMAP_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB as requested

const CACHE_CHUNK_KEY = `${IMAGE_SITEMAP_CACHE_KEY}-chunks`;

const MEDIA_SOURCE_KEYS = [
  "url",
  "image",
  "src",
  "path",
  "file",
  "value",
  "original",
  "photo",
  "media",
];

function normaliseMediaValue(item) {
  if (!item) return null;
  if (typeof item === "string") return item.trim() || null;
  if (typeof item === "object") {
    for (const key of MEDIA_SOURCE_KEYS) {
      const value = item[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }
  return null;
}

function getPrimaryLocales(locales = LOCALES) {
  const byCountry = new Map();
  for (const locale of locales) {
    const [country, lang] = locale.split("-");
    if (!byCountry.has(country)) {
      byCountry.set(country, locale);
      continue;
    }

    const current = byCountry.get(country);
    if (!current.endsWith("-ar") && lang === "ar") {
      byCountry.set(country, locale);
    }
  }
  return Array.from(byCountry.values());
}

function extractMediaSources(product) {
  const sources = [];
  const push = (value) => {
    const normalised = normaliseMediaValue(value);
    if (normalised) {
      sources.push(normalised);
    }
  };

  push(product?.image);
  push(product?.video);
  push(product?.video_url);
  push(product?.videoUrl);
  push(product?.videoLink);
  push(product?.media);

  if (Array.isArray(product?.images)) {
    product.images.forEach((img) => push(img));
  }

  if (Array.isArray(product?.media_files)) {
    product.media_files.forEach((item) => push(item));
  }

  if (Array.isArray(product?.videos)) {
    product.videos.forEach((item) => push(item));
  }

  if (Array.isArray(product?.attachments)) {
    product.attachments.forEach((item) => push(item));
  }

  return sources.filter(Boolean);
}

function buildMediaPayload(product, locale, country_slug) {
  const mediaSources = extractMediaSources(product);
  if (!mediaSources.length) {
    return { images: [], videos: [] };
  }

  const title = product?.name || product?.title || `Product ${product?.id || ""}`.trim();
  const baseDescription =
    product?.description ||
    product?.short_description ||
    product?.shortDescription ||
    title;

  const geoLocation = country_slug ? country_slug.toUpperCase() : "";

  const images = [];
  const videos = [];
  const seen = new Set();
  let fallbackThumbnail = normaliseMediaValue(product?.image) || null;

  mediaSources.forEach((source) => {
    if (!source || seen.has(source)) {
      return;
    }
    seen.add(source);

    if (isValidVideoExtension(source)) {
      videos.push({
        url: source,
        title,
        description: baseDescription || title,
        thumbnail: fallbackThumbnail,
      });
      return;
    }

    const imageIndex = images.length + 1;
    const caption =
      imageIndex === 1
        ? baseDescription || title
        : `${title}${imageIndex ? ` - Image ${imageIndex}` : ""}`;

    const imageEntry = {
      url: source,
      title,
      caption,
      geoLocation,
    };

    images.push(imageEntry);

    if (!fallbackThumbnail) {
      fallbackThumbnail = source;
    }
  });

  // Ensure videos have thumbnails; fallback to first image if available
  if (videos.length && !fallbackThumbnail && images.length) {
    fallbackThumbnail = images[0].url;
  }

  if (videos.length && fallbackThumbnail) {
    videos.forEach((video) => {
      if (!video.thumbnail) {
        video.thumbnail = fallbackThumbnail;
      }
    });
  }

  return {
    images,
    videos,
  };
}

function buildProductUrl(product, locale) {
  const slug = product?.slug || product?.id || "";
  const encodedSlug = encodeURIComponent(slug);
  const idSuffix = product?.id ? `-id=${product.id}` : "";
  return `${BASE_URL}/${locale}/product/${encodedSlug}${idSuffix}`;
}

function mapProductToEntry(product, locale, country_slug) {
  const { images, videos } = buildMediaPayload(product, locale, country_slug);
  if (!images.length && !videos.length) {
    return null;
  }

  return {
    url: buildProductUrl(product, locale),
    lastModified: new Date(
      product?.updated_at || product?.updatedAt || product?.created_at || Date.now()
    ).toISOString(),
    changeFrequency: "daily",
    priority: 0.9,
    images: images.length ? images : undefined,
    videos: videos.length ? videos : undefined,
  };
}

export async function getGlobalImageEntries({ disableCache = false } = {}) {
  if (!disableCache) {
    const cached = getCachedData(IMAGE_SITEMAP_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  const selectedLocales = getPrimaryLocales();
  const entries = [];
  const seenProducts = new Set();

  for (const locale of selectedLocales) {
    const [country_slug, lang] = locale.split("-");
    try {
      const products = await fetchAllProductsForSitemap({
        locale,
        country_slug,
        lang,
      });

      products.forEach((product) => {
        const key = product?.id || `${locale}-${product?.slug}`;
        if (!key || seenProducts.has(key)) {
          return;
        }

        const entry = mapProductToEntry(product, locale, country_slug);
        if (entry) {
          entries.push(entry);
          seenProducts.add(key);
        }
      });
    } catch (error) {
      console.error(`[Image Sitemap] Failed to fetch products for ${locale}:`, error?.message);
    }
  }

  if (!disableCache) {
    setCachedData(IMAGE_SITEMAP_CACHE_KEY, entries);
  }

  clearCache(CACHE_CHUNK_KEY);

  return entries;
}

function buildChunksWithLimits(entries) {
  const chunks = [];
  let cursor = 0;

  while (cursor < entries.length) {
    const upperBound = Math.min(cursor + MAX_URLS_PER_SITEMAP, entries.length);
    let chunk = entries.slice(cursor, upperBound);
    cursor = upperBound;

    if (chunk.length === 0) {
      break;
    }

    let xmlSize = Buffer.byteLength(generateImageSitemapXML(chunk), "utf8");

    while (xmlSize > MAX_IMAGE_SITEMAP_FILE_SIZE_BYTES && chunk.length > 1) {
      cursor -= 1;
      chunk.pop();
      xmlSize = Buffer.byteLength(generateImageSitemapXML(chunk), "utf8");
    }

    if (xmlSize > MAX_IMAGE_SITEMAP_FILE_SIZE_BYTES) {
      console.warn(
        `[Image Sitemap] Chunk with single entry exceeds 50MB limit (${xmlSize} bytes) for URL: ${chunk[0]?.url}`
      );
    }

    chunks.push(chunk);
  }

  return chunks;
}

export function chunkImageEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const cached = getCachedData(CACHE_CHUNK_KEY);
  if (Array.isArray(cached)) {
    const cachedCount = cached.reduce(
      (total, chunk) => total + (Array.isArray(chunk) ? chunk.length : 0),
      0
    );
    if (cachedCount === entries.length) {
      return cached;
    }
  }

  const finalChunks = buildChunksWithLimits(entries);

  setCachedData(CACHE_CHUNK_KEY, finalChunks);

  return finalChunks;
}

export function clearCachedImageEntries() {
  clearCache(IMAGE_SITEMAP_CACHE_KEY);
  clearCache(CACHE_CHUNK_KEY);
}
