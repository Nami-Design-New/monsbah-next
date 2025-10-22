import serverAxios from "@/libs/axios/severAxios";

const COUNTRY_NAME_VARIANTS = {
  sa: ["Saudi Arabia", "Kingdom of Saudi Arabia", "المملكة العربية السعودية", "السعودية"],
  kw: ["Kuwait", "الكويت"],
  ae: ["United Arab Emirates", "Arab Emirates", "الإمارات العربية المتحدة", "الامارات", "الإمارات"],
  bh: ["Bahrain", "البحرين"],
  om: ["Oman", "سلطنة عمان", "عمان"],
  qa: ["Qatar", "قطر"],
};

/**
 * Fetch every company for a given country slug, traversing all pages.
 * Filters the response to the requested country and optionally sets language.
 */
export default async function getAllCompanies({ country_slug, lang }) {
  if (!country_slug) {
    throw new Error("country_slug is required to fetch all companies");
  }

  const allCompanies = [];
  let currentPage = 1;
  let hasMore = true;

  const requestedCountryVariants = COUNTRY_NAME_VARIANTS[country_slug?.toLowerCase()];

  while (hasMore) {
    const response = await serverAxios.get("/client/companies", {
      params: {
        page: currentPage,
        country_slug,
        per_page: 100,
        ...(lang ? { lang } : {}),
      },
      timeout: 15000,
      headers: lang
        ? {
            "Accept-Language": lang,
            lang,
          }
        : undefined,
    });

    if (response.status !== 200) {
      throw new Error(`Unexpected status ${response.status} fetching companies`);
    }

    const payload = response.data?.data || {};
    const pageData = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response.data)
          ? response.data
          : [];
    
    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    allCompanies.push(...pageData);

    const meta = payload?.meta || response.data?.meta || {};
    const lastPage = meta.last_page || meta.lastPage;
    currentPage += 1;

    if (!lastPage) {
      hasMore = pageData.length > 0;
    } else {
      hasMore = currentPage <= lastPage;
    }

    if (currentPage > 100) {
      // Safety valve to prevent runaway pagination
      hasMore = false;
    }
  }

  // Filter by requested country when API does not enforce country_slug filter
  if (requestedCountryVariants && requestedCountryVariants.length > 0) {
    const normalizedVariants = requestedCountryVariants.map((name) => name.toLowerCase());
    const filtered = allCompanies.filter((company) => {
      const companySlug =
        company.country_slug || company.countrySlug || company.country?.slug || "";
      if (companySlug) {
        return companySlug.toLowerCase() === country_slug.toLowerCase();
      }
      const companyName = (
        company.country_name ||
        company.countryName ||
        company.country ||
        ""
      ).toLowerCase();
      return normalizedVariants.includes(companyName);
    });

    if (filtered.length > 0) {
      return filtered;
    }
  }

  return allCompanies;
}
