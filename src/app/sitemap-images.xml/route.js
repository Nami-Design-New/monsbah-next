import { BASE_URL } from "@/utils/constants";
import {
  generateImageSitemapXML,
  generateSitemapIndexXML,
  calculateChunks,
  createSitemapResponse,
} from "@/utils/sitemap-utils";
import { getGlobalImageEntries } from "@/utils/imageSitemap";

export const dynamic = "force-dynamic";

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
      loc: `${BASE_URL}/sitemap-image${index}.xml`,
      lastmod,
    }));

    const xml = generateSitemapIndexXML(sitemapEntries);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
