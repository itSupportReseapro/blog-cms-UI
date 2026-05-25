"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/services/auth.service";
import { clearBlogAppSelection } from "@/lib/blogAppContext";

export default function BlogHeader() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call logout API
      await logoutUser();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local session regardless of API response
      clearBlogAppSelection();
      logout();
      router.replace("/login");
    }
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h3>Blog Admin</h3>
      <button onClick={handleLogout} type="button">
        Logout
      </button>
    </header>
  );
}
