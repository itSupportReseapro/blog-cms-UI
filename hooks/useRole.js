"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";

export function useRole() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.role ?? "guest",
      isAdmin: user?.role === "admin",
      isEditor: user?.role === "editor",
    }),
    [user]
  );
}
