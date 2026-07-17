"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BLOG_APP_OPTIONS,
  getBlogAppByKey,
  getCurrentBlogAppId,
  getCurrentBlogAppKey,
  setCurrentBlogAppKey,
} from "@/lib/blogAppContext";

export function useBlogApp() {
  const [appKey, setAppKey] = useState(getCurrentBlogAppKey);
  const [appId, setAppId] = useState(getCurrentBlogAppId);

  useEffect(() => {
    setAppKey(getCurrentBlogAppKey());
    setAppId(getCurrentBlogAppId());
  }, []);

  const selectAppKey = useCallback((nextKey) => {
    const resolvedAppId = setCurrentBlogAppKey(nextKey);
    setAppKey(nextKey);
    setAppId(resolvedAppId);
    return resolvedAppId;
  }, []);

  const selectAppId = useCallback((nextAppId) => {
    // Fallback/backward-compatibility: try to match by key if passed a key
    if (typeof nextAppId === "string" && isNaN(Number(nextAppId))) {
      return selectAppKey(nextAppId);
    }
    // Otherwise it's an ID, since all IDs are 12 we just select by the default or first key
    const target = BLOG_APP_OPTIONS.find((app) => app.id === Number(nextAppId));
    if (target) {
      return selectAppKey(target.key);
    }
    return selectAppKey(BLOG_APP_OPTIONS[0].key);
  }, [selectAppKey]);

  return {
    appId,
    appKey,
    app: getBlogAppByKey(appKey),
    appOptions: BLOG_APP_OPTIONS,
    selectAppId,
    selectAppKey,
  };
}
