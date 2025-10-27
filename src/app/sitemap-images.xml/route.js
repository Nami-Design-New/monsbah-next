import { BASE_URL } from "@/utils/constants";
import {
  generateImageSitemapXML,
  generateSitemapIndexXML,
  createSitemapResponse,
} from "@/utils/sitemap-utils";
import { getGlobalImageEntries, chunkImageEntries } from "@/utils/imageSitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allEntries = await getGlobalImageEntries();
    if (!allEntries.length) {
      const xml = generateImageSitemapXML([]);
      return createSitemapResponse(xml);
    }

    const chunks = chunkImageEntries(allEntries);
    const totalChunks = chunks.length;

    if (totalChunks <= 1) {
      const singleChunk = chunks[0] || allEntries;
      const xml = generateImageSitemapXML(singleChunk);
      return createSitemapResponse(xml);
    }

    const lastmod = new Date().toISOString();
    const sitemapEntries = chunks.map((_, index) => {
      return {
        loc: `${BASE_URL}/sitemap-image${index}.xml`,
        lastmod,
      };
    });

    const xml = generateSitemapIndexXML(sitemapEntries);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
