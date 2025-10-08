import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetAskComments(id) {
  const lang = useSelector((state) => state.language.lang);

  const { isLoading, data, error } = useQuery({
    queryKey: ["ask-comments", lang, id],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/client/question-comments", {
          params: {
            question_id: id,
          },
        });
        if (res.status === 200) {
          return res.data?.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    enabled: Boolean(id),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { isLoading, data, error };
}

export default useGetAskComments;
