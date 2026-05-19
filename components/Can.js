"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import roleMap from "@/lib/roleMap";

/**
 * Permission Guard Component
 * 
 * Renders children only if the current user has ALL specified permissions.
 * Uses whitelist-based permission checking.
 * 
 * @param {object} props
 * @param {string|string[]} props.action - Permission(s) to check (e.g., "blog.create" or ["blog.create", "blog.publish"])
 * @param {string} [props.fallback] - Optional fallback UI to render if permission denied
 * @param {React.ReactNode} props.children - Content to render if authorized
 * 
 * Usage:
 * <Can action="blog.create">
 *   <button>Create Blog</button>
 * </Can>
 * 
 * <Can action={["blog.create", "blog.publish"]} fallback={<p>No access</p>}>
 *   <BlogForm />
 * </Can>
 */
export function Can({ action, fallback = null, children }) {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    if (!user) return false;

    // Get the effective role for this app
    const platformRole = String(user?.platform_role ?? "").toLowerCase();
    const globalRole = String(user?.role ?? "guest").toLowerCase();

    const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
    const apps = Array.isArray(user?.apps) ? user.apps : [];
    const currentApp = apps.find((a) => a.app_key === APP_KEY);
    const appRole = String(currentApp?.role ?? globalRole).toLowerCase();

    // Resolve effective role: super_admin overrides everything
    const effectiveRole =
      platformRole === "super_admin" ? "super_admin" : appRole;

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

    // Normalize action to array
    const requiredActions = Array.isArray(action) ? action : [action];

    // Check if user has ALL required permissions (whitelist)
    return requiredActions.every((requiredAction) =>
      permissions.includes("*") || permissions.includes(requiredAction)
    );
  }, [user, action]);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}

/**
 * Hook version for imperative permission checking.
 * 
 * Usage:
 * const { can, cannot } = useCanAccess();
 * if (can("blog.create")) { ... }
 */
export function useCanAccess() {
  const { user } = useAuth();

  return useMemo(() => {
    const getPermissions = () => {
      if (!user) return [];

      const platformRole = String(user?.platform_role ?? "").toLowerCase();
      const globalRole = String(user?.role ?? "guest").toLowerCase();

      const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
      const apps = Array.isArray(user?.apps) ? user.apps : [];
      const currentApp = apps.find((a) => a.app_key === APP_KEY);
      const appRole = String(currentApp?.role ?? globalRole).toLowerCase();

      const effectiveRole =
        platformRole === "super_admin" ? "super_admin" : appRole;

      const apiPermissions = Array.isArray(user?.permissions)
        ? user.permissions
            .map((permission) =>
              typeof permission === "string" ? permission : permission?.perm_key || permission?.key
            )
            .filter(Boolean)
        : [];

      return [
        ...(roleMap[effectiveRole] ?? roleMap[globalRole] ?? []),
        ...apiPermissions,
      ];
    };

    const permissions = getPermissions();

    return {
      // Check if user has the permission
      can: (checkAction) => {
        const actions = Array.isArray(checkAction)
          ? checkAction
          : [checkAction];
        return permissions.includes("*") || actions.every((a) => permissions.includes(a));
      },

      // Check if user does NOT have the permission
      cannot: (checkAction) => {
        const actions = Array.isArray(checkAction)
          ? checkAction
          : [checkAction];
        return !(permissions.includes("*") || actions.every((a) => permissions.includes(a)));
      },

      // Get all permissions for the current user
      permissions,

      // Get effective role and permissions info
      info: () => {
        const platformRole = String(user?.platform_role ?? "").toLowerCase();
        const globalRole = String(user?.role ?? "guest").toLowerCase();
        const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "dev_blog_cms";
        const apps = Array.isArray(user?.apps) ? user.apps : [];
        const currentApp = apps.find((a) => a.app_key === APP_KEY);
        const appRole = String(currentApp?.role ?? globalRole).toLowerCase();
        const effectiveRole =
          platformRole === "super_admin" ? "super_admin" : appRole;

        return {
          effectiveRole,
          platformRole,
          globalRole,
          appRole,
          permissions,
        };
      },
    };
  }, [user]);
}
