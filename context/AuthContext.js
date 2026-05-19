"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { loginUser } from "@/services/auth.service";
import authClient from "@/lib/authAxios";
import {
  authStorageKeys,
  clearAuthCookie,
  extractAppInfo,
  normalizeAccessToken,
  setAuthCookie,
} from "@/lib/authTokens";

const {
  token: TOKEN_KEY,
  refreshToken: REFRESH_TOKEN_KEY,
  user: USER_KEY,
  appId: APP_ID_KEY,
  appKey: APP_KEY_STORAGE,
} = authStorageKeys;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || "2";

export const AuthContext = createContext(null);

function extractPermissionKeys(payload) {
  const data = payload?.data ?? payload ?? {};
  const candidates = [
    data?.permissions,
    data?.data?.permissions,
    data?.entitlements?.permissions,
    data?.data?.entitlements?.permissions,
  ];
  const permissions = candidates.find(Array.isArray) || [];

  return permissions
    .map((permission) =>
      typeof permission === "string" ? permission : permission?.perm_key || permission?.key
    )
    .filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appId, setAppId] = useState(null);
  const [appKey, setAppKey] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);
    const storedAppId = sessionStorage.getItem(APP_ID_KEY);
    const storedAppKey = sessionStorage.getItem(APP_KEY_STORAGE);

    const normalizedStoredToken = normalizeAccessToken(storedToken);

    if (normalizedStoredToken) {
      setToken(normalizedStoredToken);
      setAuthCookie(normalizedStoredToken);
      sessionStorage.setItem(TOKEN_KEY, String(normalizedStoredToken));
    } else if (storedToken) {
      sessionStorage.removeItem(TOKEN_KEY);
    }

    if (storedRefreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, storedRefreshToken);
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Restore app info
      if (storedAppId) setAppId(storedAppId);
      if (storedAppKey) setAppKey(storedAppKey);
    }

    setLoading(false);
  }, []);

  // Listen for successful token refresh from authAxios interceptor
  useEffect(() => {
    const handleTokenRefresh = (event) => {
      const { token: newToken, refreshToken: newRefreshToken } = event.detail;
      console.log("[AuthContext] Token refreshed event received, new token:", newToken?.slice(0, 20) + "...");
      setToken(newToken);
      setAuthCookie(newToken);
      sessionStorage.setItem(TOKEN_KEY, String(newToken));
      sessionStorage.setItem(REFRESH_TOKEN_KEY, String(newRefreshToken));
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh);
    return () => window.removeEventListener("tokenRefreshed", handleTokenRefresh);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    console.log("Login data received:", data);
    
    const nextToken = normalizeAccessToken(data.token ?? data.accessToken ?? data.access_token);
    const nextRefreshToken = data.refreshToken ?? data.refresh_token ?? null;
    const nextUser = data.user ?? null;

    console.log("Extracted token:", nextToken);
    console.log("Extracted refreshToken:", nextRefreshToken);
    console.log("Extracted user:", nextUser);

    if (!nextToken) {
      throw new Error("Login failed: invalid token");
    }

    // Prefer explicit app context from login payload, then JWT apps.
    const extracted = extractAppInfo(nextUser, APP_KEY);
    const nextAppId = data.app_id || credentials?.app_id || extracted.appId;
    const nextAppKey = data.app_key || credentials?.app_key || extracted.appKey || APP_KEY;

    sessionStorage.setItem(TOKEN_KEY, String(nextToken));

    if (nextRefreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, String(nextRefreshToken));
    }

    let nextUserWithEntitlements = nextUser;

    try {
      const entitlementResponse = await authClient.get(`/apps/${nextAppKey}/entitlements`, {
        params: { company_id: extracted.companyId || COMPANY_ID },
      });
      const permissions = extractPermissionKeys(entitlementResponse.data);

      if (permissions.length) {
        nextUserWithEntitlements = {
          ...nextUser,
          permissions,
          entitlements: entitlementResponse.data?.data ?? entitlementResponse.data,
        };
      }
    } catch {
      nextUserWithEntitlements = nextUser;
    }

    setToken(nextToken);
    setUser(nextUserWithEntitlements);
    setAppId(nextAppId);
    setAppKey(nextAppKey);

    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUserWithEntitlements));
    if (nextAppId) sessionStorage.setItem(APP_ID_KEY, String(nextAppId));
    if (nextAppKey) sessionStorage.setItem(APP_KEY_STORAGE, nextAppKey);

    setAuthCookie(nextToken);

    console.log("Auth state updated - isAuthenticated:", Boolean(nextToken), "appId:", nextAppId, "appKey:", nextAppKey);

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAppId(null);
    setAppKey(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(APP_ID_KEY);
    sessionStorage.removeItem(APP_KEY_STORAGE);
    clearAuthCookie();
  };

  const updateUserContext = (newUser) => {
    setUser(newUser);
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      appId,
      appKey,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateUserContext,
    }),
    [user, token, loading, appId, appKey]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
