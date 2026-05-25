const BLOG_APP_STORAGE_KEY = "blogCmsAppId";
const BLOG_APP_SELECTED_KEY = "blogCmsAppSelected";

function toNumber(value, fallback) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : fallback;
}

export const BLOG_APP_OPTIONS = [
  {
    id: toNumber(process.env.NEXT_PUBLIC_PUBMANU_BLOG_APP_ID, 12),
    key: "pubmanu",
    label: process.env.NEXT_PUBLIC_PUBMANU_BLOG_APP_LABEL || "Pubmanu",
  },
  {
    id: toNumber(process.env.NEXT_PUBLIC_SCHOLAR_HANGOUT_BLOG_APP_ID, 13),
    key: "scholar-hangout",
    label:
      process.env.NEXT_PUBLIC_SCHOLAR_HANGOUT_BLOG_APP_LABEL || "Scholar Hangout",
  },
].filter((app, index, apps) => {
  return app.id && apps.findIndex((candidate) => candidate.id === app.id) === index;
});

export const DEFAULT_BLOG_APP_ID = toNumber(
  process.env.NEXT_PUBLIC_BLOG_APP_ID || process.env.NEXT_PUBLIC_APP_ID,
  BLOG_APP_OPTIONS[0]?.id || 12
);

export function getBlogAppById(appId) {
  const numericAppId = Number(appId);
  return BLOG_APP_OPTIONS.find((app) => app.id === numericAppId) || null;
}

export function getCurrentBlogAppId() {
  if (typeof window === "undefined") {
    return DEFAULT_BLOG_APP_ID;
  }

  try {
    const storedAppId = Number(window.localStorage.getItem(BLOG_APP_STORAGE_KEY));
    return getBlogAppById(storedAppId)?.id || DEFAULT_BLOG_APP_ID;
  } catch {
    return DEFAULT_BLOG_APP_ID;
  }
}

export function setCurrentBlogAppId(appId) {
  const nextAppId = getBlogAppById(appId)?.id || DEFAULT_BLOG_APP_ID;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BLOG_APP_STORAGE_KEY, String(nextAppId));
    window.localStorage.setItem(BLOG_APP_SELECTED_KEY, "true");
  }

  return nextAppId;
}

export function hasSelectedBlogApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(BLOG_APP_SELECTED_KEY) === "true";
}

export function clearBlogAppSelection() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BLOG_APP_SELECTED_KEY);
}
