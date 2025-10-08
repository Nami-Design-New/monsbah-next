import FollowersList from "@/components/followers/FollowersList";
import { getAuthedUser } from "@/services/auth/getAuthedUser";
import { getFollowers } from "@/services/followers/getFollowers";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import React from "react";

export default async function page() {
  const t = await getTranslations();
  const lang = (await getLocale()).split("-")[1];
  const queryClient = getQueryClient();
  const user = await getAuthedUser();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["followers", lang, user.id],
    queryFn: ({ pageParam = 1 }) => getFollowers(user?.id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FollowersList userId={user?.id} />
    </HydrationBoundary>
  );
}
