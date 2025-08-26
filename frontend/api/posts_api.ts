import { fetcher } from "@/utils/api";
import useSWR from "swr";
import api, { BASE_URL } from "@/utils/api";

type Post = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
};

export function usePosts() {
  const { data, error, mutate } = useSWR<Post[]>(`${BASE_URL}/posts`, fetcher, {
    refreshInterval: 0,
  });

  if (error) {
    console.error("Failed to fetch posts:", error);
  }

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function fetchPosts() {
  try {
    const response = await api.get<Post[]>(`${BASE_URL}/posts`);
    console.log("Posts:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}