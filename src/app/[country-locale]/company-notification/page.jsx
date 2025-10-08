import NotificationList from "@/components/profile/notifications/NotificationList";
import getNotifications from "@/services/notifications/getNotifications";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });
  return (
    <div>
      {" "}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotificationList />
      </HydrationBoundary>
    </div>
  );
}
