import FollowingList from "@/components/followers/FollowingList";
import { getAuthedUser } from "@/services/auth/getAuthedUser";
import { getFollowing } from "@/services/followers/getFollowing";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";

export default async function page() {
  const t = await getTranslations();
  const lang = (await getLocale()).split("-")[1];
  const queryClient = getQueryClient();
  const user = await getAuthedUser();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["user", "user-followings", lang, user.id],
    queryFn: ({ pageParam = 1 }) => getFollowing(user?.id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FollowingList userId={user?.id} />
    </HydrationBoundary>
  );
}
