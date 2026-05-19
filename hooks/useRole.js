"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import roleMap from "@/lib/roleMap";

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";

export function useRole() {
  const { user } = useAuth();

  return useMemo(() => {
    const platformRole = String(user?.platform_role ?? "").toLowerCase();
    const globalRole   = String(user?.role ?? "guest").toLowerCase();

    // Find this app's role from the JWT apps array
    const apps = Array.isArray(user?.apps) ? user.apps : [];
    const currentApp = apps.find((a) => a.app_key === APP_KEY);
    const appRole = String(currentApp?.role ?? globalRole).toLowerCase();

    // Resolve effective permissions: super_admin overrides everything
    const effectiveRole = platformRole === "super_admin" ? "super_admin" : appRole;
    const apiPermissions = Array.isArray(user?.permissions)
      ? user.permissions
          .map((permission) =>
            typeof permission === "string" ? permission : permission?.perm_key || permission?.key
          )
          .filter(Boolean)
      : [];
    const permissions = [
      ...(roleMap[effectiveRole] ?? roleMap[globalRole] ?? []),
      ...apiPermissions,
    ];

    return {
      role:         currentApp?.role ?? user?.role ?? "guest",
      globalRole:   user?.role ?? "guest",
      platformRole: user?.platform_role ?? "",
      appRole:      currentApp?.role ?? user?.role ?? "guest",
      permissions,
      isAdmin:      platformRole === "super_admin" || globalRole === "admin",
      isSuperAdmin: platformRole === "super_admin",
      isEditor:     ["editor", "lead"].includes(appRole),
      can:          (action) => permissions.includes("*") || permissions.includes(action),
    };
  }, [user]);
}

