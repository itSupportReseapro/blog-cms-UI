export const getSelectedLabel = (dropdownState, field, value) => {
  if (!value) {
    return "";
  }

  const match = dropdownState[field]?.options?.find(
    (option) => String(option.value) === String(value)
  );

  return match?.label || value;
};

export const resolveAuthorName = () => {
  if (typeof window === "undefined") {
    return "Unknown user";
  }

  try {
    const user = JSON.parse(window.sessionStorage.getItem("authUser") || "{}");
    const fullName = [user?.first_name, user?.last_name, user?.firstName, user?.lastName]
      .filter((value) => typeof value === "string" && value.trim())
      .filter((value, index, values) => index < 2 || !values.slice(0, 2).some(Boolean))
      .join(" ")
      .trim();
    const fallbackName = [user?.name, user?.full_name, user?.fullName, user?.username, user?.user_name]
      .find((value) => typeof value === "string" && value.trim())
      ?.replace(/\s+/g, " ")
      .trim();

    return fullName || fallbackName || "Unknown user";
  } catch {
    return "Unknown user";
  }
};

export const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const estimateReadTime = (html) => {
  const plainText = String(html || "").replace(/<[^>]+>/g, " ").trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
};

export const extractFileName = (path) => {
  if (!path) {
    return "";
  }

  const normalized = String(path).split("?")[0];
  const parts = normalized.split("/");
  return parts[parts.length - 1] || normalized;
};
