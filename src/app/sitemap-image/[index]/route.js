import { createSitemapResponse, generateImageSitemapXML } from "@/utils/sitemap-utils";
import { getGlobalImageEntries, chunkImageEntries } from "@/utils/imageSitemap";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawIndex = resolvedParams?.index;
    const chunkIndex = parseInt(rawIndex, 10);

    if (Number.isNaN(chunkIndex) || chunkIndex < 0) {
      return new Response("Invalid sitemap index", { status: 400 });
    }

    const entries = await getGlobalImageEntries();
    const chunks = chunkImageEntries(entries);

    if (chunks.length === 0) {
      if (chunkIndex === 0) {
        const xml = generateImageSitemapXML([]);
        return createSitemapResponse(xml);
      }
      return new Response("Sitemap chunk not found", { status: 404 });
    }

    if (chunkIndex >= chunks.length) {
      return new Response("Sitemap chunk not found", { status: 404 });
    }

    const xml = generateImageSitemapXML(chunks[chunkIndex]);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("[Image Sitemap] Error generating chunk:", error);
    return new Response("Error generating image sitemap chunk", { status: 500 });
  }
}
