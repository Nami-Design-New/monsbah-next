import { BASE_URL } from "@/utils/constants";
import fetchAllProductImagesForSitemap from "@/services/products/fetchAllProductImagesForSitemap";
import { isValidVideoExtension } from "@/utils/helpers";
import {
  MAX_URLS_PER_SITEMAP,
  generateImageSitemapXML,
  getCachedData,
  setCachedData,
  clearCache,
} from "@/utils/sitemap-utils";

export const IMAGE_SITEMAP_CACHE_KEY = "sitemap-images-global";
export const MAX_IMAGE_SITEMAP_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const CACHE_CHUNK_KEY = `${IMAGE_SITEMAP_CACHE_KEY}-chunks`;
const FALLBACK_VIDEO_THUMBNAIL = `${BASE_URL}/branding/icon.svg`;

function normalizeMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const base = BASE_URL?.replace(/\/+$/, "") || "https://www.monsbah.com";
  const normalizedPath = trimmed.startsWith("/")
    ? trimmed.slice(1)
    : trimmed;

  return `${base}/${normalizedPath}`;
}

function buildMediaEntry(item) {
  const mediaUrl = normalizeMediaUrl(
    typeof item === "string" ? item : item?.image
  );
  const id = typeof item === "object" ? item?.id : null;

  if (!mediaUrl) {
    return null;
  }

  const entry = {
    url: mediaUrl,
    id: id != null ? String(id) : null,
  };

  if (isValidVideoExtension(mediaUrl)) {
    entry.videos = [
      {
        url: mediaUrl,
        title: id != null ? `Media ${id}` : "Product Media Video",
        description: id != null ? `Media ${id}` : "Product Media Video",
        thumbnail: FALLBACK_VIDEO_THUMBNAIL,
        id: id != null ? String(id) : null,
      },
    ];
  } else {
    entry.images = [
      {
        url: mediaUrl,
        id: id != null ? String(id) : null,
      },
    ];
  }

  return entry;
}

export async function getGlobalImageEntries({ disableCache = false } = {}) {
  if (!disableCache) {
    const cached = getCachedData(IMAGE_SITEMAP_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  const mediaItems = await fetchAllProductImagesForSitemap();
  const entries = [];
  const seen = new Set();

  mediaItems.forEach((item) => {
    const entry = buildMediaEntry(item);
    if (!entry || !entry.url) {
      return;
    }

    if (seen.has(entry.url)) {
      return;
    }

    entries.push(entry);
    seen.add(entry.url);
  });

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
    const upperBound = Math.min(
      cursor + MAX_URLS_PER_SITEMAP,
      entries.length
    );
    let chunk = entries.slice(cursor, upperBound);
    cursor = upperBound;

    if (chunk.length === 0) {
      break;
    }

    let xmlSize = Buffer.byteLength(
      generateImageSitemapXML(chunk),
      "utf8"
    );

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
      (total, chunk) =>
        total + (Array.isArray(chunk) ? chunk.length : 0),
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
