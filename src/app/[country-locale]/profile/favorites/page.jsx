import FavoritsList from "@/components/profile/myfavorites/FavoritsList";
import { getUserType } from "@/services/auth/getUserType";
import { getFavorites } from "@/services/favorites/getFavorites";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/profile/favorites");

  return {
    title: t("favorites.title"),
    description: t("favorites.description"),
    alternates,
  };
}
export default async function Favorites() {
  const queryClient = getQueryClient();
  const locale = await getLocale();
  const lang = locale.split("-")[1];

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user-favorites", lang],
    queryFn: ({ pageParam = 1 }) => getFavorites(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <div className="tab-content">
      <div className="tab-content-pane ">
        <div className="Dashpoard_section w-100">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FavoritsList />
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
