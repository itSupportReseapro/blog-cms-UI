"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TableProvider } from "@/context/TableContext";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      // Only redirect if we have no refresh token (completely logged out)
      const refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("refreshToken") : null;
      
      if (!refreshToken) {
        router.replace("/login");
      }
      // If we have a refresh token, don't redirect - let the interceptor handle the refresh
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <p style={{ padding: "24px" }}>Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const tableColumns = [
    { key: "id", label: "ID", sortable: false },
    { key: "title", label: "Blog Title", sortable: true },
    { key: "author", label: "Author", sortable: true },
    { key: "lastUpdated", label: "Last Updated", sortable: true },
    { key: "status", label: "Status", sortable: false }
  ];

  const statusBadges = {
    published: { color: "#4CAF50", bgColor: "#E8F5E9" },
    draft: { color: "#FF9800", bgColor: "#FFF3E0" },
    archived: { color: "#9E9E9E", bgColor: "#F5F5F5" },
    pending: { color: "#2196F3", bgColor: "#E3F2FD" },
    success: { color: "#4CAF50", bgColor: "#E8F5E9" },
    error: { color: "#F44336", bgColor: "#FFEBEE" }
  };

  const tableActions = [
    {
      label: "Details",
      key: "details",
      condition: (row) => true
    },
    {
      label: "Edit",
      key: "edit",
      condition: (row) => true
    },
    {
      label: "Publish",
      key: "publish",
      condition: (row) => row.status && row.status !== "published"
    },
    {
      label: "Unpublish",
      key: "unpublish",
      condition: (row) => row.status === "published"
    },
    {
      label: "Delete",
      key: "delete",
      condition: (row) => true
    },
    {
      label: "Rollback",
      key: "rollback",
      condition: (row) => row.status === "archived"
    },
    {
      label: "Undo",
      key: "undo",
      condition: (row) => true
    }
  ];

  return (
    <TableProvider
      columns={tableColumns}
      statusBadges={statusBadges}
      actions={tableActions}
      pageSize={10}
      rowsPerPageOptions={[10, 25, 50]}
    >
      {children}
    </TableProvider>
  );
}
