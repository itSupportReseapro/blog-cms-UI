import apiClient from "@/lib/axios";
import {
  CMS_DEFAULTS,
  BLOG_DROPDOWN_LIST_PATH,
  BLOG_DROPDOWN_CREATE_PATH,
  getCurrentCmsAppId,
} from "./config";
import { buildUrl, getErrorMessage } from "./http";
import {
  DROPDOWN_OPTIONS_CACHE,
  REMOTE_DROPDOWN_UNSUPPORTED_FIELDS,
  upsertLookupEntity,
  createDropdownCacheKey,
  clearDropdownCache,
  clearLookupListCache,
} from "./cache";
import {
  getClusterById,
  getCategoryById,
  getSubCategoryById,
  createCluster,
  createCategory,
  createSubCategory,
  listClusters,
  listCategories,
  listSubCategories,
} from "./lookup";
import {
  LOCATION_COUNTRIES_URL,
  LOCATION_STATES_URL,
  LOCATION_DISTRICTS_URL,
  LOCATION_CITIES_URL,
  normalizeCountryCollection,
  normalizeCountryPayload,
  mapLocationOptions,
  fetchLocationHierarchyOptions,
} from "./location";

export { clearDropdownCache };

function normalizeDropdownOptions(payload) {
  const source = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  const normalized = source
    .map((item) => {
      if (typeof item === "string") {
        return { value: item, label: item };
      }

      const value = item?.value ?? item?.id ?? item?.name ?? item?.label;
      const label = item?.label ?? item?.name ?? String(value ?? "");

      if (!value || !label) {
        return null;
      }

      return {
        value: String(value),
        label: String(label),
      };
    })
    .filter(Boolean);

  const dedupedByValue = new Map();
  normalized.forEach((option) => {
    dedupedByValue.set(String(option.value), option);
  });

  return Array.from(dedupedByValue.values());
}

async function fetchRemoteDropdownOptions(field, params = {}) {
  if (REMOTE_DROPDOWN_UNSUPPORTED_FIELDS.has(field)) {
    throw new Error(`Remote dropdown endpoint not available for ${field}`);
  }

  const requestParams = {
    app_id: params?.app_id || getCurrentCmsAppId() || CMS_DEFAULTS.appId,
    ...params,
  };

  if (requestParams.group && !requestParams.cluster_id) {
    requestParams.cluster_id = requestParams.group;
  }

  const cacheKey = createDropdownCacheKey(field, requestParams);

  if (DROPDOWN_OPTIONS_CACHE.has(cacheKey)) {
    return DROPDOWN_OPTIONS_CACHE.get(cacheKey);
  }

  const requestPromise = apiClient
    .get(buildUrl(BLOG_DROPDOWN_LIST_PATH), {
      params: {
        field,
        ...requestParams,
      },
    })
    .then((response) => normalizeDropdownOptions(response?.data));

  DROPDOWN_OPTIONS_CACHE.set(cacheKey, requestPromise);

  try {
    const options = await requestPromise;
    DROPDOWN_OPTIONS_CACHE.set(cacheKey, options);
    return options;
  } catch (error) {
    DROPDOWN_OPTIONS_CACHE.delete(cacheKey);

    if (error?.response?.status === 404) {
      REMOTE_DROPDOWN_UNSUPPORTED_FIELDS.add(field);
    }

    throw error;
  }
}

export async function fetchBlogDropdownOptions(field, params = {}) {
  const appId = params?.app_id || getCurrentCmsAppId() || CMS_DEFAULTS.appId;
  const selectedClusterId = params?.group || params?.cluster_id || null;
  const selectedCountryId = params?.country || params?.country_id || null;
  const selectedStateId = params?.state || params?.state_id || null;
  const selectedDistrictId = params?.district || params?.district_id || null;

  if (field === "country") {
    try {
      const response = await apiClient.get(LOCATION_COUNTRIES_URL);
      const countries = normalizeCountryCollection(response?.data);

      return mapLocationOptions(countries);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch country dropdown options"));
    }
  }

  if (field === "state") {
    try {
      return await fetchLocationHierarchyOptions(
        LOCATION_STATES_URL,
        selectedCountryId,
        ["country_id", "countryId", "country", "parent_id"],
        ["country_id", "countryId", "country", "parent_id"]
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch state dropdown options"));
    }
  }

  if (field === "district") {
    try {
      return await fetchLocationHierarchyOptions(
        LOCATION_DISTRICTS_URL,
        selectedStateId,
        ["state_id", "stateId", "state", "parent_id"],
        ["state_id", "stateId", "state", "parent_id"]
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch district dropdown options"));
    }
  }

  if (field === "city") {
    try {
      return await fetchLocationHierarchyOptions(
        LOCATION_CITIES_URL,
        selectedDistrictId,
        ["district_id", "districtId", "district", "parent_id"],
        ["district_id", "districtId", "district", "parent_id"]
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch city dropdown options"));
    }
  }

  if (field === "group") {
    try {
      return await fetchRemoteDropdownOptions(field, params);
    } catch {
      // Fallback to ID scan when dropdown endpoint is unavailable for this field.
    }

    const clusters = await listClusters(appId);
    return clusters.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }

  if (field === "category") {
    try {
      return await fetchRemoteDropdownOptions(field, {
        ...params,
        cluster_id: selectedClusterId || undefined,
      });
    } catch {
      // Fallback to ID scan when dropdown endpoint is unavailable for this field.
    }

    const categories = await listCategories(selectedClusterId, appId);
    return categories.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }

  if (field === "subcategory") {
    try {
      return await fetchRemoteDropdownOptions(field, {
        ...params,
        cluster_id: selectedClusterId || undefined,
      });
    } catch {
      // Fallback to ID scan when dropdown endpoint is unavailable for this field.
    }

    const subCategories = await listSubCategories(selectedClusterId, appId);
    return subCategories.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }

  try {
    return await fetchRemoteDropdownOptions(field, params);
  } catch (error) {
    throw new Error(getErrorMessage(error, `Failed to fetch ${field} dropdown options`));
  }
}

export async function createBlogDropdownOption(field, value, params = {}) {
  const appId = params?.app_id || getCurrentCmsAppId() || CMS_DEFAULTS.appId;
  const label = typeof value === "string" ? value : value?.name || "";
  const selectedCountryId = params?.country || params?.country_id || null;
  const selectedStateId = params?.state || params?.state_id || null;
  const selectedDistrictId = params?.district || params?.district_id || null;

  const basePayload = {
    app_id: appId,
    name: label,
    obj_1: "",
    obj_2: "",
    obj_3: "",
    obj_4: "",
    obj_5: "",
    status: CMS_DEFAULTS.status,
    created_by: CMS_DEFAULTS.createdBy,
  };

  if (field === "group") {
    const response = await createCluster(basePayload);
    const created = response?.data;
    upsertLookupEntity("cluster", created);
    clearLookupListCache("cluster");
    clearDropdownCache("group");
    clearDropdownCache("category");
    clearDropdownCache("subcategory");

    return {
      value: String(created?.id || label),
      label: created?.name || label,
    };
  }

  if (field === "category") {
    const clusterId = params?.group || params?.cluster_id;

    if (!clusterId) {
      throw new Error("Select group before adding category");
    }

    const response = await createCategory({
      ...basePayload,
      cluster_id: Number(clusterId),
    });
    const created = response?.data;
    upsertLookupEntity("category", created);
    clearLookupListCache("category");
    clearDropdownCache("category");
    clearDropdownCache("subcategory");

    return {
      value: String(created?.id || label),
      label: created?.name || label,
    };
  }

  if (field === "subcategory") {
    const clusterId = params?.group || params?.cluster_id;

    if (!clusterId) {
      throw new Error("Select group before adding sub category");
    }

    const response = await createSubCategory({
      ...basePayload,
      cluster_id: Number(clusterId),
    });
    const created = response?.data;
    upsertLookupEntity("subcategory", created);
    clearLookupListCache("subcategory");
    clearDropdownCache("subcategory");

    return {
      value: String(created?.id || label),
      label: created?.name || label,
    };
  }

  if (field === "country") {
    const payload = normalizeCountryPayload(value);

    if (!payload.name || !payload.regional_name || !payload.code) {
      throw new Error("Name, regional name, and code are required for country");
    }

    try {
      const response = await apiClient.post(LOCATION_COUNTRIES_URL, payload);
      const created = response?.data?.data || response?.data;
      clearDropdownCache("country");

      return {
        value: String(created?.id ?? created?.code ?? payload.code),
        label: created?.name || payload.name,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create country"));
    }
  }

  if (field === "state") {
    if (!selectedCountryId) {
      throw new Error("Select country before adding state");
    }

    try {
      const response = await apiClient.post(LOCATION_STATES_URL, {
        country_id: Number(selectedCountryId),
        name: String(label || "").trim(),
      });
      const created = response?.data?.data || response?.data;
      clearDropdownCache("state");
      clearDropdownCache("district");
      clearDropdownCache("city");

      return {
        value: String(created?.id ?? label),
        label: created?.name || label,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create state"));
    }
  }

  if (field === "district") {
    if (!selectedStateId) {
      throw new Error("Select state before adding district");
    }

    try {
      const response = await apiClient.post(LOCATION_DISTRICTS_URL, {
        state_id: Number(selectedStateId),
        name: String(label || "").trim(),
      });
      const created = response?.data?.data || response?.data;
      clearDropdownCache("district");
      clearDropdownCache("city");

      return {
        value: String(created?.id ?? label),
        label: created?.name || label,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create district"));
    }
  }

  if (field === "city") {
    if (!selectedDistrictId) {
      throw new Error("Select district before adding city");
    }

    try {
      const response = await apiClient.post(LOCATION_CITIES_URL, {
        district_id: Number(selectedDistrictId),
        name: String(label || "").trim(),
      });
      const created = response?.data?.data || response?.data;
      clearDropdownCache("city");

      return {
        value: String(created?.id ?? label),
        label: created?.name || label,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create city"));
    }
  }

  try {
    const response = await apiClient.post(buildUrl(BLOG_DROPDOWN_CREATE_PATH), {
      field,
      label,
      ...params,
    });
    clearDropdownCache(field);

    const options = normalizeDropdownOptions(response?.data);

    if (options.length > 0) {
      return options[0];
    }

    return {
      value: label,
      label,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, `Failed to create ${field} dropdown option`));
  }
}
