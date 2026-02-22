import apiClient from "@/lib/axios";

export async function fetchPosts() {
  try {
    const response = await apiClient.get("/blog/posts");
    return response.data;
  } catch {
    return [];
  }
}
