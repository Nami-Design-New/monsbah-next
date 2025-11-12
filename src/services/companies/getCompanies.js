import serverAxios from "@/libs/axios/severAxios";

export default async function getCompanies({
  pageParam = 1,
  city_id,
  country_slug,
  category_slug,
  sub_category_slug,
  search,
}) {
  const res = await serverAxios.get("/client/companies", {
    params: {
      page: pageParam,
      city_id,
      country_slug,
      category_slug,
      sub_category_slug,
      search,
    },
    // Enable Next.js cache for 24 hours
    next: {
      revalidate: 86400, // 24 hours in seconds
      tags: ['companies']
    }
  });

  if (res.status === 200) {
    return res.data;
  } else {
    throw new Error("Failed to fetch companies");
  }
}
