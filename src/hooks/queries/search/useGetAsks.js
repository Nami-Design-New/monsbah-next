// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { useSearchParams } from "react-router-dom";
// import clientAxios from "../../utils/clientAxios";

// function useGetAsks(country) {
//   const lang = useSelector((state) => state.language.lang);
//   const [searchParams] = useSearchParams();
//   const search = searchParams.get("search");

//   const {
//     isLoading,
//     data,
//     error,
//     hasNextPage,
//     fetchNextPage,
//     isFetchingNextPage,
//   } = useInfiniteQuery({
//     queryKey: ["asks", lang, search, country],

//     queryFn: async ({ pageParam = 1 }) => {
//       const res = await clientAxios.get("/client/questions", {
//         params: {
//           page: pageParam,
//           search: search,
//           country_id: country,
//         },
//       });
//       if (res.status === 200) {
//         return {
//           data: res.data?.data?.data,
//           total: res.data?.data?.meta?.total,
//           per_page: res.data?.data?.meta?.per_page,
//         };
//       } else {
//         throw new Error("Failed to fetch profiles");
//       }
//     },

//     getNextPageParam: (lastPage, pages) => {
//       const isMore = lastPage.data.length >= lastPage.per_page;
//       return isMore ? pages.length + 1 : undefined;
//     },

//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//     refetchOnReconnect: false,
//     retry: false,
//   });

//   return {
//     isLoading,
//     data: data?.pages.flatMap((page) => page.data) || [],
//     error,
//     hasNextPage,
//     fetchNextPage,
//     isFetchingNextPage,
//   };
// }

// export default useGetAsks;
