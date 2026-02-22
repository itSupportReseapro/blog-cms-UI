"use client";

import { useEffect, useState } from "react";
import { fetchPosts } from "@/services/blog.service";

export function useBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      try {
        const data = await fetchPosts();
        if (mounted) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  return { posts, loading };
}
