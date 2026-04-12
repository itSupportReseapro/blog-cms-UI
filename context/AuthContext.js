"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { loginUser } from "@/services/auth.service";

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";
const COOKIE_KEY = "blog_cms_token";

export const AuthContext = createContext(null);

function setAuthCookie(token) {
  if (!token) return;
  document.cookie = `${COOKIE_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
      setAuthCookie(storedToken);
    }

    if (storedRefreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, storedRefreshToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    console.log("Login data received:", data);
    
    const nextToken = data.token ?? data.accessToken ?? data.access_token;
    const nextRefreshToken = data.refreshToken ?? data.refresh_token ?? null;
    const nextUser = data.user ?? null;

    console.log("Extracted token:", nextToken);
    console.log("Extracted refreshToken:", nextRefreshToken);
    console.log("Extracted user:", nextUser);

    if (!nextToken) {
      throw new Error("Login failed: invalid token");
    }

    setToken(nextToken);
    setUser(nextUser);

    sessionStorage.setItem(TOKEN_KEY, String(nextToken));

    if (nextRefreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, String(nextRefreshToken));
    }

    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setAuthCookie(nextToken);

    console.log("Auth state updated, isAuthenticated should be:", Boolean(nextToken));

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    clearAuthCookie();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
