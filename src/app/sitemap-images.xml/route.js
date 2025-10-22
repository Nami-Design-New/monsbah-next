import { BASE_URL } from "@/utils/constants";
import { LOCALES } from "@/i18n/routing";
import getProductsForSitemap from "@/services/products/getProductsForSitemap";
import {
  generateImageSitemapXML,
  generateSitemapIndexXML,
  calculateChunks,
  getCachedData,
  setCachedData,
  createSitemapResponse,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

const IMAGE_SITEMAP_CACHE_KEY = "sitemap-images-global";
const MAX_PAGES_PER_LOCALE = 400;
const PAGE_LENGTH = 50;

function buildProductMediaEntries({ product, locale, country_slug }) {
  const encodedSlug = encodeURIComponent(product.slug || product.id);
  const productUrl = `${BASE_URL}/${locale}/product/${encodedSlug}${
    product.id ? `-id=${product.id}` : ""
  }`;

  const images = [];
  const videos = [];

  if (product.image) {
    images.push({
      url: product.image,
      title: product.name || product.title || "",
      caption: product.description || product.name || "",
      geoLocation: country_slug.toUpperCase(),
    });
  }

  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img, index) => {
      images.push({
        url: typeof img === "string" ? img : img.url || img.image,
        title: product.name || product.title || "",
        caption: `${product.name || ""} - Image ${index + 2}`,
        geoLocation: country_slug.toUpperCase(),
      });
    });
  }

  const videoUrl = (product.video || "").trim();
  const VIDEO_EXT_REGEX = /\.(mp4|mov|m4v|webm|avi|mkv|flv)$/i;
  const primaryThumb = images.length > 0 ? images[0].url : undefined;

  if (videoUrl && VIDEO_EXT_REGEX.test(videoUrl)) {
    videos.push({
      url: videoUrl,
      title: product.name || product.title || "Product video",
      description: product.description || product.name || "Product video",
      thumbnail: primaryThumb || videoUrl,
    });
  } else if (typeof product.image === "string" && VIDEO_EXT_REGEX.test(product.image)) {
    videos.push({
      url: product.image,
      title: product.name || product.title || "Product video",
      description: product.description || product.name || "Product video",
      thumbnail: primaryThumb || product.image,
    });
  }

  if (images.length === 0 && videos.length === 0) {
    return null;
  }

  return {
    url: productUrl,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()).toISOString(),
    changeFrequency: "daily",
    priority: 0.9,
    images,
    videos,
  };
}

export async function getGlobalImageEntries() {
  const cached = getCachedData(IMAGE_SITEMAP_CACHE_KEY);
  if (cached) {
    return cached;
  }

  console.log(`[Images Sitemap] Fetching products from all locales...`);
  const allEntries = [];

  for (const locale of LOCALES) {
    const [country_slug, lang] = locale.split("-");

    try {
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= MAX_PAGES_PER_LOCALE) {
        const response = await getProductsForSitemap({
          page,
          lang,
          country_slug,
          length: PAGE_LENGTH,
        });

        const pageProducts = response?.items || [];
        pageProducts.forEach((product) => {
          const entry = buildProductMediaEntries({ product, locale, country_slug });
          if (entry) {
            allEntries.push(entry);
          }
        });

        hasMore = Boolean(response?.links?.next);
        page += 1;
      }

      console.log(
        `[Images Sitemap] ${locale}: accumulated ${allEntries.length} total entries so far`
      );
    } catch (error) {
      console.error(`[Images Sitemap] Error fetching ${locale}:`, error.message);
    }
  }

  setCachedData(IMAGE_SITEMAP_CACHE_KEY, allEntries);
  console.log(`[Images Sitemap] Total entries cached: ${allEntries.length}`);
  return allEntries;
}

/**
 * Global image sitemap for all products across all locales
 * URL: https://monsbah.com/sitemap-images.xml
 */
export async function GET() {
  try {
    const allEntries = await getGlobalImageEntries();
    const totalChunks = calculateChunks(allEntries.length || 0);

    if (totalChunks <= 1) {
      const xml = generateImageSitemapXML(allEntries);
      return createSitemapResponse(xml);
    }

    const lastmod = new Date().toISOString();
    const sitemapEntries = Array.from({ length: totalChunks }, (_, index) => ({
      loc: `${BASE_URL}/sitemap-images${index}.xml`,
      lastmod,
    }));

    const xml = generateSitemapIndexXML(sitemapEntries);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
