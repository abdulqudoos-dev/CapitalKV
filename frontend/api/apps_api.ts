import { fetcher } from "@/utils/api";
import useSWR from "swr";
import api, { BASE_URL } from "@/utils/api";

type App = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  avatar: string;
  userRating?: number;
  isRatingSubmitted?: boolean;
};

export function useApps() {
  const { data, error, mutate } = useSWR<App[]>(`${BASE_URL}/apps`, fetcher, {
    refreshInterval: 0,
  });

  if (error) {
    console.error("Failed to fetch apps:", error);
  }

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function fetchApps() {
  try {
    const response = await api.get<{ apps: App[] }>(`${BASE_URL}/apps`);
    console.log("Apps:", response.data.apps);
    return response.data.apps;
  } catch (error) {
    console.error("Error fetching apps:", error);
    throw error;
  }
}