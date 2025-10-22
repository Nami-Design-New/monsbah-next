import { generateImageSitemapXML, createSitemapResponse, getChunkItems } from "@/utils/sitemap-utils";
import { getGlobalImageEntries } from "../sitemap-images.xml/route";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const rawIndex = resolvedParams.index;
    const chunkIndex = Number.parseInt(rawIndex, 10);

    if (Number.isNaN(chunkIndex) || chunkIndex < 0) {
      return new Response("Invalid chunk index", { status: 400 });
    }

    const allEntries = await getGlobalImageEntries();
    const chunkEntries = getChunkItems(allEntries, chunkIndex);

    if (!chunkEntries || chunkEntries.length === 0) {
      return new Response("Chunk not found", { status: 404 });
    }

    const xml = generateImageSitemapXML(chunkEntries);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating image sitemap chunk:", error);
    return new Response(`Error generating sitemap: ${error.message}`, { status: 500 });
  }
}
