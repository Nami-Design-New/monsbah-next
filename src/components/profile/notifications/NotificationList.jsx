"use client";

import EmptyData from "@/components/shared/EmptyData";
import NotificationCard from "./NotificationCard";
import { useRef } from "react";
import NotificationLoader from "@/components/shared/loaders/NotificationLoader";
import useGetNotifications from "@/hooks/queries/notifications/useGetNotifications";
import { useTranslations } from "use-intl";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function NotificationList() {
  const t = useTranslations();
  const sectionRef = useRef();
  const {
    data: notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNotifications();
  const allNotifications =
    notifications?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useInfiniteScroll({
    ref: sectionRef,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
    offset: 200,
    debounceMs: 250,
  });

  return (
    <div className="notifications_section" ref={sectionRef}>
      <div className="row justify-content-center">
        <div className="col-12 d-flex flex-column gap-3 p-2">
          {allNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              item={notification}
              bgColor="bg-white"
            />
          ))}
          {(isLoading || isFetchingNextPage) && (
            <>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <NotificationLoader key={index} />
                ))}
            </>
          )}
        </div>
      </div>

      {!isLoading &&
        !isFetchingNextPage &&
        allNotifications?.length === 0 &&
        !hasNextPage && (
          <EmptyData minHeight="200px">
            <p>{t("profile.noNotificationsYet")}</p>
          </EmptyData>
        )}
    </div>
  );
}
