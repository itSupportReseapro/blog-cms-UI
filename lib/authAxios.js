import axios from "axios";
import {
  authStorageKeys,
  clearAuthCookie,
  normalizeAccessToken,
  pickTokenString,
  setAuthCookie,
} from "@/lib/authTokens";

const APP_ENV = process.env.NEXT_PUBLIC_ENV || "development";

const AUTH_BASE_MAP = {
  development: process.env.NEXT_PUBLIC_DEV_AUTH_API,
  test: process.env.NEXT_PUBLIC_TEST_AUTH_API,
  production: process.env.NEXT_PUBLIC_PROD_AUTH_API,
};

const AUTH_REFRESH_MAP = {
  development: process.env.NEXT_PUBLIC_DEV_AUTH_REFRESH_URL,
  test: process.env.NEXT_PUBLIC_TEST_AUTH_REFRESH_URL,
  production: process.env.NEXT_PUBLIC_PROD_AUTH_REFRESH_URL,
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

function getRefreshUrl() {
  return (
    AUTH_REFRESH_MAP[APP_ENV] ||
    `${String(resolvedAuthBase).replace(/\/$/, "")}/auth/refresh`
  );
}

function parseRefreshTokens(payload, fallbackRefreshToken = null) {
  const nestedPayload =
    payload?.data && typeof payload.data === "object" ? payload.data : payload || {};

  return {
    accessToken: pickTokenString(nestedPayload, payload),
    refreshToken:
      nestedPayload?.refreshToken ||
      nestedPayload?.refresh_token ||
      payload?.refreshToken ||
      payload?.refresh_token ||
      fallbackRefreshToken,
  };
}

export async function refreshStoredAuthToken() {
  if (typeof window === "undefined") {
    throw new Error("Token refresh is only available in the browser");
  }

  const storedRefreshToken = sessionStorage.getItem(authStorageKeys.refreshToken);

  if (!storedRefreshToken) {
    throw new Error("Refresh token missing");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(getRefreshUrl(), { refreshToken: storedRefreshToken })
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  const refreshPayload = await refreshPromise;
  const { accessToken, refreshToken } = parseRefreshTokens(refreshPayload, storedRefreshToken);
  const normalizedAccessToken = normalizeAccessToken(accessToken);

  if (!normalizedAccessToken) {
    throw new Error("Token refresh failed: access token missing");
  }

  sessionStorage.setItem(authStorageKeys.token, normalizedAccessToken);

  if (refreshToken) {
    sessionStorage.setItem(authStorageKeys.refreshToken, String(refreshToken));
  }

  setAuthCookie(normalizedAccessToken);

  window.dispatchEvent(
    new CustomEvent("tokenRefreshed", {
      detail: {
        token: normalizedAccessToken,
        refreshToken: refreshToken || storedRefreshToken,
      },
    })
  );

  return normalizedAccessToken;
}

function isRefreshOrLogout(url = "") {
  return (
    url.includes("/auth/refresh") ||
    url.includes("/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/logout")
  );
}

authClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !isRefreshOrLogout(config.url || "")) {
    const token = normalizeAccessToken(sessionStorage.getItem(authStorageKeys.token));

    if (token) {
      config.headers = config.headers || {};
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
    const responseMessage = String(error?.response?.data?.message || "").toLowerCase();
    const isTokenMessage =
      responseMessage.includes("access token") ||
      responseMessage.includes("token expired") ||
      responseMessage.includes("token invalid");
    const shouldAttemptRefresh = status === 401 || status === 403 || isTokenMessage;

    if (
      typeof window === "undefined" ||
      !originalRequest ||
      originalRequest._retry ||
      !shouldAttemptRefresh ||
      isRefreshOrLogout(originalRequest.url || "")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshStoredAuthToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return authClient(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem(authStorageKeys.token);
      sessionStorage.removeItem(authStorageKeys.refreshToken);
      clearAuthCookie();
      return Promise.reject(refreshError);
    }
  }
);

export default authClient;
