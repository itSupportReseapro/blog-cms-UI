"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AppSelectorPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace("/blog/dashboard");
      return;
    }
    router.replace("/login");
  }, [isAuthenticated, loading, router]);

  return <p style={{ padding: "24px" }}>Redirecting...</p>;
}
