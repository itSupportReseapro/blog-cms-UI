const BLOG_APP_KEY_STORAGE_KEY = "blogCmsAppKey";
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
    id: toNumber(process.env.NEXT_PUBLIC_SCHOLAR_HANGOUT_BLOG_APP_ID || process.env.NEXT_PUBLIC_SCHOLARHANGOUT_BLOG_APP_ID, 12),
    key: "scholar-hangout",
    label:
      process.env.NEXT_PUBLIC_SCHOLAR_HANGOUT_BLOG_APP_LABEL ||
      process.env.NEXT_PUBLIC_SCHOLARHANGOUT_BLOG_APP_LABEL ||
      "Scholar Hangout",
  },
  {
    id: toNumber(process.env.NEXT_PUBLIC_SWASTYAREKHA_BLOG_APP_ID || process.env.NEXT_PUBLIC_SWASTY_AREKHA_BLOG_APP_ID, 12),
    key: "swastyarekha",
    label:
      process.env.NEXT_PUBLIC_SWASTYAREKHA_BLOG_APP_LABEL ||
      process.env.NEXT_PUBLIC_SWASTY_AREKHA_BLOG_APP_LABEL ||
      "Swastyarekha",
  },
];

export const DEFAULT_BLOG_APP_ID = 12;

export function getBlogAppByKey(key) {
  return BLOG_APP_OPTIONS.find((app) => app.key === key) || BLOG_APP_OPTIONS[0];
}

export function getBlogAppById(appId) {
  const numericAppId = Number(appId);
  if (typeof window !== "undefined") {
    const currentKey = window.localStorage.getItem(BLOG_APP_KEY_STORAGE_KEY);
    const currentApp = BLOG_APP_OPTIONS.find((app) => app.key === currentKey);
    if (currentApp && currentApp.id === numericAppId) {
      return currentApp;
    }
  }
  return BLOG_APP_OPTIONS.find((app) => app.id === numericAppId) || null;
}

export function getCurrentBlogAppKey() {
  if (typeof window === "undefined") {
    return BLOG_APP_OPTIONS[0].key;
  }
  try {
    return window.localStorage.getItem(BLOG_APP_KEY_STORAGE_KEY) || BLOG_APP_OPTIONS[0].key;
  } catch {
    return BLOG_APP_OPTIONS[0].key;
  }
}

export function getCurrentBlogAppId() {
  const currentKey = getCurrentBlogAppKey();
  return getBlogAppByKey(currentKey)?.id || DEFAULT_BLOG_APP_ID;
}

export function setCurrentBlogAppKey(key) {
  const app = getBlogAppByKey(key);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BLOG_APP_KEY_STORAGE_KEY, app.key);
    window.localStorage.setItem(BLOG_APP_STORAGE_KEY, String(app.id));
    window.localStorage.setItem(BLOG_APP_SELECTED_KEY, "true");
  }

  return app.id;
}

export function setCurrentBlogAppId(appId) {
  const numericAppId = Number(appId);
  const app = BLOG_APP_OPTIONS.find((candidate) => candidate.id === numericAppId) || BLOG_APP_OPTIONS[0];
  return setCurrentBlogAppKey(app.key);
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

  window.localStorage.removeItem(BLOG_APP_KEY_STORAGE_KEY);
  window.localStorage.removeItem(BLOG_APP_STORAGE_KEY);
  window.localStorage.removeItem(BLOG_APP_SELECTED_KEY);
}
