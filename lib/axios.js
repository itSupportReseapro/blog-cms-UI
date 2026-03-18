import axios from "axios";

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
    const token = sessionStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
