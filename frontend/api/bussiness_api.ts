import { fetcher } from "@/utils/api";
import useSWR from "swr";

export function useBusinesses() {
  const { data, error, mutate } = useSWR(
    `/users/me/business`,
    fetcher
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate, // Manually trigger re-fetch when needed
  };
}
