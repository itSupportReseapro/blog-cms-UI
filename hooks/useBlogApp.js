"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BLOG_APP_OPTIONS,
  getBlogAppById,
  getCurrentBlogAppId,
  setCurrentBlogAppId,
} from "@/lib/blogAppContext";

export function useBlogApp() {
  const [appId, setAppId] = useState(getCurrentBlogAppId);

  useEffect(() => {
    setAppId(getCurrentBlogAppId());
  }, []);

  const selectAppId = useCallback((nextAppId) => {
    const resolvedAppId = setCurrentBlogAppId(nextAppId);
    setAppId(resolvedAppId);
    return resolvedAppId;
  }, []);

  return {
    appId,
    app: getBlogAppById(appId),
    appOptions: BLOG_APP_OPTIONS,
    selectAppId,
  };
}
