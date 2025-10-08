import clientAxios from "@/libs/axios/clientAxios";
import { useAuthModal } from "@/stores/useAuthModal";
import { useInfiniteQuery } from "@tanstack/react-query";

function useGetNotifications() {
  const { userType } = useAuthModal((state) => state);
  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get(`/${userType}/notifications`, {
        params: {
          page: pageParam,
        },
      });

      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch notifications");
      }
    },

    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return {
    isLoading,
    data,
    total: data?.pages?.[0]?.total || 0,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetNotifications;
