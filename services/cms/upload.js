import { ENV_KEY, UPLOAD_BASE_MAP, UPLOAD_DOMAIN_MAP } from "./config";

export function getCurrentUploadBase() {
  return UPLOAD_BASE_MAP[ENV_KEY] || UPLOAD_BASE_MAP.development;
}

export function getCurrentUploadDomain() {
  return UPLOAD_DOMAIN_MAP[ENV_KEY] || UPLOAD_DOMAIN_MAP.development;
}

function resolveUploadUserId() {
  if (typeof window === "undefined") {
    return "UnknownUser";
  }

  try {
    const storedUser = JSON.parse(window.localStorage.getItem("user") || "{}");
    return storedUser?.user_id || "UnknownUser";
  } catch {
    return "UnknownUser";
  }
}

export async function uploadCmsAsset(file, options = {}) {
  if (!file) {
    throw new Error("No file selected for upload");
  }

  const { appId = 26, userId } = options;
  const resolvedUserId = userId || resolveUploadUserId();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("app_id", String(appId));
  formData.append("user_id", String(resolvedUserId));
  formData.append("created_by", String(resolvedUserId));
  formData.append("last_modified_by", String(resolvedUserId));

  const uploadBase = getCurrentUploadBase();
  const uploadDomain = String(getCurrentUploadDomain() || "").trim();
  let response = null;
  let data = null;

  response = await fetch(`${uploadBase}/api/upload`, {
    method: "POST",
    headers: {
      "X-Upload-Domain": uploadDomain,
    },
    body: formData,
  });

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response || !response.ok) {
    throw new Error(data?.message || "File upload failed");
  }

  const url = data?.urls?.friendly || data?.urls?.canonical;

  if (!url) {
    throw new Error("Upload succeeded but URL is missing");
  }

  return {
    url,
    response: data,
  };
}
