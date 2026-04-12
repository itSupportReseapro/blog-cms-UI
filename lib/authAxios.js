import axios from "axios";

const APP_ENV = process.env.NEXT_PUBLIC_ENV || "development";

const AUTH_BASE_MAP = {
  development: process.env.NEXT_PUBLIC_DEV_AUTH_API,
  test: process.env.NEXT_PUBLIC_TEST_AUTH_API,
  production: process.env.NEXT_PUBLIC_PROD_AUTH_API,
};

const resolvedAuthBase =
  AUTH_BASE_MAP[APP_ENV] ||
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";

const authClient = axios.create({
  baseURL: String(resolvedAuthBase).replace(/\/$/, ""),
});

let refreshPromise = null;

authClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if ((originalRequest.url || "").includes("/auth/refresh") || (originalRequest.url || "").includes("/refresh")) {
      return Promise.reject(error);
    }

    const storedRefreshToken = sessionStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = authClient
          .post("/refresh", { refreshToken: storedRefreshToken })
          .then((response) => response.data)
          .catch(async (refreshError) => {
            if (refreshError?.response?.status === 404) {
              const fallbackResponse = await authClient.post("/auth/refresh", {
                refreshToken: storedRefreshToken,
              });
              return fallbackResponse.data;
            }

            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshPayload = await refreshPromise;
      const newAccessToken =
        refreshPayload?.token || refreshPayload?.accessToken || refreshPayload?.access_token;
      const newRefreshToken =
        refreshPayload?.refreshToken || refreshPayload?.refresh_token || storedRefreshToken;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      sessionStorage.setItem("authToken", String(newAccessToken));
      sessionStorage.setItem("refreshToken", String(newRefreshToken));

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return authClient(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("refreshToken");
      document.cookie = "blog_cms_token=; path=/; max-age=0; samesite=lax";
      return Promise.reject(refreshError);
    }
  }
);

export default authClient;