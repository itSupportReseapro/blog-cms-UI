import apiClient from "@/lib/axios";
import { CMS_BASE_URL } from "./config";

export function buildUrl(path) {
  return `${CMS_BASE_URL}${path}`;
}

export function unwrapSingle(payload) {
  const data = payload?.data ?? null;

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data;
}

export function isNotFound(error) {
  return error?.response?.status === 404;
}

export function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function getCmsErrorMessage(error, fallbackMessage = "Something went wrong") {
  return getErrorMessage(error, fallbackMessage);
}

export async function getSingle(path, fallbackMessage) {
  try {
    const response = await apiClient.get(buildUrl(path));
    return unwrapSingle(response.data);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }

    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}

export async function postResource(path, payload, fallbackMessage) {
  try {
    const response = await apiClient.post(buildUrl(path), payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}

export async function putResource(path, payload, fallbackMessage) {
  try {
    const response = await apiClient.put(buildUrl(path), payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}

export function unwrapCollection(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

export async function getCollection(paths = []) {
  for (const path of paths) {
    try {
      const response = await apiClient.get(buildUrl(path));
      const items = unwrapCollection(response?.data);
      if (Array.isArray(items)) {
        return items;
      }
    } catch {
      // Try next candidate path.
    }
  }

  return [];
}
