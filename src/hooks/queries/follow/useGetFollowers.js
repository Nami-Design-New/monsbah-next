import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import clientAxios from "../../../libs/axios/clientAxios";

function useGetFollowers() {
  const lang = useSelector((state) => state.language.lang);

  const user = useSelector((state) => state.clientData.client);

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["followers", lang, user],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get("/client/followers", {
        params: {
          page: pageParam,
          profile_id: user?.id,
          type: "followers",
        },
      });
      if (res.status === 200) {
        return {
          data: res.data?.data?.data,
          total: res.data?.data?.meta?.total,
          per_page: res.data?.data?.meta?.per_page,
        };
      } else {
        throw new Error("Failed to fetch followers");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const isMore = lastPage.data.length >= lastPage.per_page;
      return isMore ? pages.length + 1 : undefined;
    },

    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    isLoading,
    data: data?.pages.flatMap((page) => page.data) || [],
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetFollowers;
