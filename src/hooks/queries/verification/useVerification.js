import { useMutation } from "@tanstack/react-query";
import { verify as verifyApi } from "../../services/apiVerification";

function useVerification() {
  const { mutate: verify, isLoading } = useMutation({
    mutationFn: (requestBody) => verifyApi(requestBody),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,

    onSuccess: () => {},
  });
  return { verify, isLoading };
}

export default useVerification;
