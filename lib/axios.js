import axios from "axios";
import { refreshStoredAuthToken } from "@/lib/authAxios";
import { authStorageKeys, normalizeAccessToken } from "@/lib/authTokens";

const APP_ENV = process.env.NEXT_PUBLIC_ENV || "development";

const API_BASE_MAP = {
  development:
    process.env.NEXT_PUBLIC_DEV_API_BASE_URL || process.env.NEXT_PUBLIC_DEV_AUTH_API || "",
  test: process.env.NEXT_PUBLIC_TEST_API_BASE_URL || process.env.NEXT_PUBLIC_TEST_AUTH_API || "",
  production:
    process.env.NEXT_PUBLIC_PROD_API_BASE_URL || process.env.NEXT_PUBLIC_PROD_AUTH_API || "",
};

const resolvedApiBase = API_BASE_MAP[APP_ENV] || process.env.NEXT_PUBLIC_API_BASE_URL || "";

const apiClient = axios.create({
  baseURL: String(resolvedApiBase).replace(/\/$/, ""),
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = normalizeAccessToken(sessionStorage.getItem(authStorageKeys.token));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (
      typeof window === "undefined" ||
      !originalRequest ||
      originalRequest._retry ||
      (status !== 401 && status !== 403)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshStoredAuthToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
