import { BASE_URL } from "@/utils/constants";
import getAllCompanies from "@/services/companies/getAllCompanies";
import {
  generateCachedChunkedSitemap,
  createSitemapResponse,
  calculateChunks,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    const [country_slug, lang] = locale.split("-");

    // Ensure language cookie is set for serverAxios interceptor
    const { cookies: setCookie } = await import("next/headers");
    const cookieStore = await setCookie();
    cookieStore.set("NEXT_LOCALE", locale);

    let companiesArray = [];

    try {
      console.log(`[Companies Sitemap] Fetching all companies for ${country_slug}`);

      const companiesPromise = getAllCompanies({ country_slug, lang });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Companies API timeout after 15s")), 15000)
      );

      const companies = await Promise.race([companiesPromise, timeoutPromise]);
      companiesArray = Array.isArray(companies) ? companies : [];

      console.log(
        `[Companies Sitemap] Retrieved ${companiesArray.length} companies for ${country_slug}`
      );
    } catch (fetchError) {
      console.error("[Companies Sitemap] Failed to fetch companies:", fetchError.message);
      companiesArray = [];
    }

    const cacheKey = `sitemap-companies-${locale}`;
    const totalChunks = calculateChunks(companiesArray.length || 0);

    const sitemapOptions = {
      cacheKey,
      fetchDataFn: async () => companiesArray,
      transformToUrlsFn: (companies) => {
        return companies.map((company) => {
          const identifier = company.slug || company.id;
          return {
            url: `${BASE_URL}/${locale}/company-details/${identifier}`,
            lastModified: new Date(
              company.updated_at || company.created_at || Date.now()
            ).toISOString(),
            changeFrequency: "monthly",
            priority: 0.7,
          };
        });
      },
    };

    const xml = await generateCachedChunkedSitemap(
      totalChunks > 1
        ? {
            ...sitemapOptions,
            chunkIndex: 0,
          }
        : sitemapOptions
    );

    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
