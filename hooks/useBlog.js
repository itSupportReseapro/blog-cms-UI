"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBlogs } from "@/services/blog.service";

export function useBlog({ status = "all", page = 1, limit = 100, appId } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: Number(page || 1),
    limit: Number(limit || 100),
    total: 0,
    totalPages: 1,
  });

  const loadPosts = useCallback(async () => {
    const data = await fetchBlogs({ status, page, limit, appId });

    setPosts(Array.isArray(data?.data) ? data.data : []);
    setMeta({
      page: Number(data?.page || page || 1),
      limit: Number(data?.limit || limit || 100),
      total: Number(data?.total || 0),
      totalPages: Number(data?.totalPages || 1),
    });
  }, [status, page, limit, appId]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const data = await fetchBlogs({ status, page, limit, appId });
        if (mounted) {
          setPosts(Array.isArray(data?.data) ? data.data : []);
          setMeta({
            page: Number(data?.page || page || 1),
            limit: Number(data?.limit || limit || 100),
            total: Number(data?.total || 0),
            totalPages: Number(data?.totalPages || 1),
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [status, page, limit, appId]);

  return { posts, loading, meta, refetch: loadPosts };
}
