import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromFavorite as removeFromFavoriteApi } from "../services/apiFavorites";

function useRemoveFromFavorite() {
  const queryClient = useQueryClient();
  const { mutate: removeFromFavorite, isLoading } = useMutation({
    mutationFn: (requestBody) => removeFromFavoriteApi(requestBody),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });
  return { removeFromFavorite, isLoading };
}

export default useRemoveFromFavorite;
