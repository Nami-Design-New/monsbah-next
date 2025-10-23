import { LOCALES as SUPPORTED_LOCALES } from "@/i18n/routing";
import { META_DATA_CONTENT, BASE_URL } from "@/utils/constants";
import { getBlogs } from "@/services/blogs/getBlogs";
import {
  getCachedData,
  setCachedData,
  createSitemapResponse,
} from "@/utils/sitemap-utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const NEWS_SITEMAP_CACHE_KEY = "sitemap-news-global";
const MAX_NEWS_ENTRIES = 1000;

function escapeXml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapCdata(value = "") {
  const sanitized = value.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${sanitized}]]>`;
}

function toISODate(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  const parsed = new Date(dateValue);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  // Attempt to parse known formats (e.g., "2024-01-05 12:34:56")
  const normalized = dateValue.replace(" ", "T");
  const normalizedDate = new Date(normalized);
  if (!Number.isNaN(normalizedDate.getTime())) {
    return normalizedDate.toISOString();
  }

  return new Date().toISOString();
}

function buildNewsEntry({ blog, locale }) {
  if (!blog?.slug) {
    return null;
  }

  const [, lang = "ar"] = locale.split("-");
  const publicationName =
    META_DATA_CONTENT?.[lang]?.title || META_DATA_CONTENT?.ar?.title || "Monsbah";
  const title = blog?.title || blog?.name || `Blog ${blog?.id || ""}`;
  const publicationDate =
    blog?.published_at ||
    blog?.publication_date ||
    blog?.date ||
    blog?.updated_at ||
    blog?.created_at ||
    new Date().toISOString();

  const loc = `${BASE_URL}/${locale}/blogs/${encodeURIComponent(blog.slug)}`;

  return {
    loc,
    language: lang,
    publicationName,
    publicationDate: toISODate(publicationDate),
    title,
  };
}

function generateNewsSitemapXML(entries) {
  const urlset = entries
    .map((entry) => {
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${wrapCdata(entry.publicationName)}</news:name>
        <news:language>${escapeXml(entry.language)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(entry.publicationDate)}</news:publication_date>
      <news:title>${wrapCdata(entry.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlset}
</urlset>`;
}

async function collectNewsEntries() {
  const cached = getCachedData(NEWS_SITEMAP_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const cookieStore = await cookies();
  const entries = [];

  for (const locale of SUPPORTED_LOCALES) {
    try {
      cookieStore.set("NEXT_LOCALE", locale);
      const blogs = await getBlogs();

      if (!Array.isArray(blogs)) {
        continue;
      }

      for (const blog of blogs) {
        const entry = buildNewsEntry({ blog, locale });
        if (entry) {
          entries.push(entry);
        }
      }
    } catch (error) {
      console.error(`[News Sitemap] Failed to fetch blogs for ${locale}:`, error);
    }
  }

  const uniqueMap = new Map();
  entries.forEach((entry) => {
    uniqueMap.set(`${entry.loc}`, entry);
  });

  const sortedEntries = Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)
  );

  const limitedEntries = sortedEntries.slice(0, MAX_NEWS_ENTRIES);
  setCachedData(NEWS_SITEMAP_CACHE_KEY, limitedEntries);

  return limitedEntries;
}

export async function GET() {
  try {
    const entries = await collectNewsEntries();
    const xml = generateNewsSitemapXML(entries);
    return createSitemapResponse(xml);
  } catch (error) {
    console.error("[News Sitemap] Error generating sitemap:", error);
    return new Response("Error generating news sitemap", { status: 500 });
  }
}
