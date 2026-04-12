import apiClient from "@/lib/axios";
import {
  LOCATION_COUNTRIES_URL,
  LOCATION_STATES_URL,
  LOCATION_DISTRICTS_URL,
  LOCATION_CITIES_URL,
} from "./config";

export {
  LOCATION_COUNTRIES_URL,
  LOCATION_STATES_URL,
  LOCATION_DISTRICTS_URL,
  LOCATION_CITIES_URL,
};

export function normalizeCountryCollection(payload) {
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

export function normalizeLocationCollection(payload) {
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

export function mapLocationOptions(items) {
  return items
    .map((item) => ({
      value: String(item?.id ?? item?.code ?? item?.name ?? ""),
      label: String(item?.name ?? item?.label ?? "").trim(),
    }))
    .filter((option) => option.value && option.label);
}

export async function fetchLocationHierarchyOptions(
  url,
  parentValue,
  requestParentKeys = [],
  responseParentKeys = []
) {
  if (!parentValue) {
    return [];
  }

  const normalizedParentValue = String(parentValue);

  for (const parentKey of requestParentKeys) {
    try {
      const response = await apiClient.get(url, {
        params: {
          [parentKey]: parentValue,
        },
      });

      const items = normalizeLocationCollection(response?.data);

      if (!items.length) {
        continue;
      }

      // Some endpoints return unfiltered lists even when a parent query is sent.
      // Enforce parent linkage locally to avoid showing wrong children.
      const filteredItems = items.filter((item) =>
        responseParentKeys.some(
          (responseKey) => String(item?.[responseKey] ?? "") === normalizedParentValue
        )
      );

      if (filteredItems.length > 0) {
        return mapLocationOptions(filteredItems);
      }

      // If parent keys are absent in payload shape, trust server filtering.
      const hasResponseParentField = items.some((item) =>
        responseParentKeys.some((responseKey) => responseKey in (item || {}))
      );

      if (!hasResponseParentField) {
        return mapLocationOptions(items);
      }
    } catch {
      // Continue trying the next candidate parent key.
    }
  }

  return [];
}

export function normalizeCountryPayload(input) {
  if (typeof input === "string") {
    const trimmed = input.trim();
    const normalizedCode = trimmed.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();

    return {
      name: trimmed,
      regional_name: trimmed,
      country_code: "",
      code: normalizedCode,
      phone_code: "",
    };
  }

  return {
    name: String(input?.name || "").trim(),
    regional_name: String(input?.regional_name || "").trim(),
    country_code: String(input?.country_code || "").trim(),
    code: String(input?.code || "").trim().toUpperCase(),
    phone_code: String(input?.phone_code || "").trim(),
  };
}
