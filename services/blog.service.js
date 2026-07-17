import apiClient from "@/lib/axios";
import { getCurrentBlogAppId } from "@/lib/blogAppContext";
import { getCmsBaseUrl } from "@/services/cms/config";

function buildUrl(path, appKeyOrId) {
  return `${getCmsBaseUrl(appKeyOrId)}${path}`;
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function unwrapSingle(payload) {
  const data = payload?.data ?? null;

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data;
}

export async function fetchBlogs({ status = "all", page = 1, limit = 100, appId } = {}) {
  try {
    const normalizedStatus = String(status || "all").toLowerCase();
    const resolvedAppId = Number(appId || getCurrentBlogAppId());

    const path =
      normalizedStatus === "all"
        ? `/getBlog/${resolvedAppId}`
        : `/getBlogByStatus/${resolvedAppId}/${encodeURIComponent(normalizedStatus)}`;

    const response = await apiClient.get(buildUrl(path, resolvedAppId), {
      params: { page, limit },
    });

    const payload = response?.data || {};

    return {
      success: Boolean(payload?.success),
      page: Number(payload?.page || page || 1),
      limit: Number(payload?.limit || limit || 100),
      total: Number(payload?.total || 0),
      totalPages: Number(payload?.totalPages || 1),
      data: Array.isArray(payload?.data) ? payload.data : [],
    };
  } catch {
    return {
      success: false,
      page: Number(page || 1),
      limit: Number(limit || 100),
      total: 0,
      totalPages: 1,
      data: [],
    };
  }
}

export async function fetchPosts() {
  const response = await fetchBlogs();
  return response.data;
}

export async function getBlogById(id) {
  try {
    const response = await apiClient.get(buildUrl(`/getBlogById/${id}`));
    return unwrapSingle(response?.data);
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw new Error(getErrorMessage(error, "Failed to fetch blog"));
  }
}

export async function createBlog(payload) {
  try {
    const response = await apiClient.post(buildUrl("/postBlog"), payload);
    return response?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create blog"));
  }
}

export async function updateBlog(id, payload) {
  try {
    const response = await apiClient.put(buildUrl(`/putBlog/${id}`), payload);
    return response?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update blog"));
  }
}
