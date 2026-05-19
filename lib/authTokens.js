const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";
const APP_ID_KEY = "authAppId";
const APP_KEY_STORAGE = "authAppKey";
const COOKIE_KEY = "blog_cms_token";

export const authStorageKeys = {
  token: TOKEN_KEY,
  refreshToken: REFRESH_TOKEN_KEY,
  user: USER_KEY,
  appId: APP_ID_KEY,
  appKey: APP_KEY_STORAGE,
  cookie: COOKIE_KEY,
};

export function normalizeAccessToken(token) {
  if (!token) return "";
  const normalized = String(token).trim();
  if (!normalized) return "";
  if (
    normalized === "[object Object]" ||
    normalized.toLowerCase() === "undefined" ||
    normalized.toLowerCase() === "null"
  ) {
    return "";
  }
  if (normalized.toLowerCase().startsWith("bearer ")) {
    return normalized.slice(7).trim();
  }
  return normalized;
}

export function pickTokenString(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === "string") {
      const token = normalizeAccessToken(candidate);
      if (token) return token;
      continue;
    }

    if (typeof candidate === "object") {
      const nestedToken = pickTokenString(
        candidate.accessToken,
        candidate.access_token,
        candidate.token,
        candidate.jwt,
        candidate.idToken,
        candidate.id_token
      );

      if (nestedToken) return nestedToken;
    }
  }

  return "";
}

export function decodeJwtPayload(token) {
  const cleanToken = normalizeAccessToken(token);
  const payloadPart = cleanToken.split(".")[1];

  if (!payloadPart) return null;

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json =
      typeof atob === "function"
        ? decodeURIComponent(
            Array.from(atob(padded))
              .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
              .join("")
          )
        : Buffer.from(padded, "base64").toString("utf8");

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeApp(app = {}) {
  const appKey = app.app_key ?? app.appKey ?? app.key ?? "";
  const appId = app.app_id ?? app.id ?? app.appId ?? null;

  return {
    ...app,
    id: app.id ?? appId,
    app_id: appId,
    app_key: appKey,
    app_name: app.app_name ?? app.appName ?? app.name ?? appKey,
    company_id: app.company_id ?? app.companyId ?? null,
    role: app.role ?? app.role_key ?? app.role_name ?? "",
  };
}

export function resolveUserDisplayName(user, fallbackEmail = "") {
  const primaryNameParts = [user?.first_name, user?.last_name].filter(
    (value) => typeof value === "string" && value.trim()
  );
  const secondaryNameParts = [user?.firstName, user?.lastName].filter(
    (value) => typeof value === "string" && value.trim()
  );
  const fullName = (primaryNameParts.length ? primaryNameParts : secondaryNameParts)
    .join(" ")
    .trim();
  const fallbackName = [user?.name, user?.full_name, user?.fullName, user?.username, user?.user_name]
    .find((value) => typeof value === "string" && value.trim())
    ?.replace(/\s+/g, " ")
    .trim();

  return (
    fullName ||
    fallbackName ||
    (typeof fallbackEmail === "string" && fallbackEmail.includes("@")
      ? fallbackEmail.split("@")[0]
      : "")
  );
}

function firstFilled(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
}

function isNumericId(value) {
  return typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value));
}

export function normalizeAuthUser(rawUser = {}, token = "", fallbackEmail = "") {
  const jwtUser = decodeJwtPayload(token) || {};
  const merged = { ...jwtUser, ...rawUser };
  const apps = Array.isArray(rawUser?.apps)
    ? rawUser.apps
    : Array.isArray(jwtUser?.apps)
    ? jwtUser.apps
    : [];
  const email =
    merged.email ??
    merged.email_address_personal ??
    merged.email_address_official ??
    fallbackEmail;
  const rawId = firstFilled(rawUser?.id, jwtUser?.id);
  const jwtNumericUserId = isNumericId(jwtUser?.user_id) ? jwtUser.user_id : "";
  const publicUserCode = firstFilled(
    rawUser?.user_code,
    rawUser?.user_id && !isNumericId(rawUser.user_id) ? rawUser.user_id : "",
    jwtUser?.user_code,
    jwtUser?.user_id && !isNumericId(jwtUser.user_id) ? jwtUser.user_id : ""
  );

  return {
    ...merged,
    id: firstFilled(rawId, jwtNumericUserId, ""),
    user_id: publicUserCode || "",
    user_code: publicUserCode || "",
    first_name: merged.first_name ?? merged.firstName ?? "",
    last_name: merged.last_name ?? merged.lastName ?? "",
    firstName: merged.firstName ?? merged.first_name ?? "",
    lastName: merged.lastName ?? merged.last_name ?? "",
    name: resolveUserDisplayName(merged, email),
    email,
    role: merged.role ?? merged.platform_role ?? "user",
    platform_role: merged.platform_role ?? "",
    apps: apps.map(normalizeApp),
  };
}

export function extractAppInfo(userData, expectedAppKey) {
  const apps = Array.isArray(userData?.apps) ? userData.apps : [];
  const currentApp =
    apps.find((app) => app.app_key === expectedAppKey) ||
    apps.find((app) => app.app_key) ||
    null;

  return {
    appId: currentApp?.app_id || currentApp?.id || null,
    appKey: currentApp?.app_key || expectedAppKey || null,
    companyId: currentApp?.company_id || null,
    role: currentApp?.role || null,
  };
}

export function setAuthCookie(token) {
  if (typeof document === "undefined") return;
  const safeToken = normalizeAccessToken(token);
  if (!safeToken) return;
  document.cookie = `${COOKIE_KEY}=${safeToken}; path=/; max-age=86400; samesite=lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
