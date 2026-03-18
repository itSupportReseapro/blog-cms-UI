"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBlogs } from "@/services/blog.service";

export function useBlog({ status = "all", page = 1, limit = 100 } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: Number(page || 1),
    limit: Number(limit || 100),
    total: 0,
    totalPages: 1,
  });

  const loadPosts = useCallback(async () => {
    const data = await fetchBlogs({ status, page, limit });

    setPosts(Array.isArray(data?.data) ? data.data : []);
    setMeta({
      page: Number(data?.page || page || 1),
      limit: Number(data?.limit || limit || 100),
      total: Number(data?.total || 0),
      totalPages: Number(data?.totalPages || 1),
    });
  }, [status, page, limit]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const data = await fetchBlogs({ status, page, limit });
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
  }, [status, page, limit]);

  return { posts, loading, meta, refetch: loadPosts };
}
