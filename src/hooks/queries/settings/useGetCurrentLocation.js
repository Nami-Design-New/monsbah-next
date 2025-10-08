"use client";

import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";

function useGetCurrentLocation() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["current-location"],
    queryFn: async () => {
      const res = await clientAxios.get("/client/current_location");
      if (res.status === 200) {
        return res.data?.data;
      } else {
        throw new Error("Failed to fetch sliders");
      }
    },
  });

  return { isLoading, data, error };
}

export default useGetCurrentLocation;
