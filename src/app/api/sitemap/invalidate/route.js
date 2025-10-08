import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.sitemap-cache');

export const dynamic = "force-dynamic";

// POST /api/sitemap/invalidate
// Body: { type: "all" | "products" | "blogs" | "companies", locale?: "kw-ar" }
export async function POST(request) {
  try {
    const body = await request.json();
    const { type = "all", locale, apiKey } = body;

    // Optional: Add API key authentication
    const expectedApiKey = process.env.SITEMAP_API_KEY;
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deletedFiles = [];

    // Ensure cache directory exists
    try {
      await fs.access(CACHE_DIR);
    } catch {
      return NextResponse.json({
        message: "No cache to invalidate",
        deletedFiles: [],
      });
    }

    // Read all cache files
    const files = await fs.readdir(CACHE_DIR);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const shouldDelete = (() => {
        if (type === "all") return true;

        if (locale) {
          // Invalidate specific type and locale
          return file === `${type}-${locale}.json`;
        } else {
          // Invalidate all locales for specific type
          return file.startsWith(`${type}-`);
        }
      })();

      if (shouldDelete) {
        const filePath = path.join(CACHE_DIR, file);
        await fs.unlink(filePath);
        deletedFiles.push(file);
      }
    }

    console.log(`[Sitemap Cache] Invalidated ${deletedFiles.length} cache files:`, deletedFiles);

    return NextResponse.json({
      message: `Successfully invalidated ${deletedFiles.length} cache file(s)`,
      deletedFiles,
      type,
      locale: locale || "all",
    });
  } catch (error) {
    console.error("Error invalidating sitemap cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/sitemap/invalidate - Get cache stats
export async function GET() {
  try {
    const stats = [];

    try {
      await fs.access(CACHE_DIR);
    } catch {
      return NextResponse.json({
        message: "No cache directory found",
        stats: [],
        totalSize: 0,
      });
    }

    const files = await fs.readdir(CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(CACHE_DIR, file);
      const fileStats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      totalSize += fileStats.size;

      stats.push({
        file,
        size: fileStats.size,
        sizeMB: (fileStats.size / (1024 * 1024)).toFixed(2),
        lastModified: fileStats.mtime.toISOString(),
        chunks: data.chunks?.length || 0,
        totalUrls: data.stats?.totalUrls || 0,
        lastGenerated: data.lastGenerated,
        locale: data.locale,
      });
    }

    return NextResponse.json({
      stats,
      totalFiles: stats.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json(
      { error: "Failed to get cache stats", details: error.message },
      { status: 500 }
    );
  }
}
