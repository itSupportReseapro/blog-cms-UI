import {
  CMS_DEFAULTS,
  LOOKUP_SCAN_MAX,
  LOOKUP_SCAN_MISS_LIMIT,
  getCurrentCmsAppId,
} from "./config";
import { getSingle, postResource, putResource, getCollection } from "./http";
import {
  LOOKUP_CACHE,
  LOOKUP_LIST_CACHE,
  upsertLookupEntity,
  mergeWithCache,
} from "./cache";

export function getClusterById(id) {
  return getSingle(`/getClusterById/${id}`, "Failed to fetch cluster");
}

export function createCluster(payload) {
  return postResource("/postCluster", payload, "Failed to create cluster");
}

export function updateCluster(id, payload) {
  return putResource(`/putCluster/${id}`, payload, "Failed to update cluster");
}

export function getCategoryById(id) {
  return getSingle(`/getCategoryById/${id}`, "Failed to fetch category");
}

export function createCategory(payload) {
  return postResource("/postCategory", payload, "Failed to create category");
}

export function updateCategory(id, payload) {
  return putResource(`/putCategory/${id}`, payload, "Failed to update category");
}

export function getSubCategoryById(id) {
  return getSingle(`/getSubCategoryById/${id}`, "Failed to fetch sub category");
}

export function createSubCategory(payload) {
  return postResource("/postSubCategory", payload, "Failed to create sub category");
}

export function updateSubCategory(id, payload) {
  return putResource(`/putSubCategory/${id}`, payload, "Failed to update sub category");
}

export async function scanById(
  getById,
  maxId = LOOKUP_SCAN_MAX,
  missLimit = LOOKUP_SCAN_MISS_LIMIT
) {
  const items = [];
  let misses = 0;

  for (let id = 1; id <= maxId; id += 1) {
    const entity = await getById(id);

    if (entity) {
      items.push(entity);
      misses = 0;
    } else {
      misses += 1;
      if (items.length > 0 && misses >= missLimit) {
        break;
      }
    }
  }

  return items;
}

export async function listClusters(appIdOverride) {
  const appId = appIdOverride || getCurrentCmsAppId();
  const cacheKey = `cluster:${appId}`;

  if (Array.isArray(LOOKUP_LIST_CACHE[cacheKey])) {
    return LOOKUP_LIST_CACHE[cacheKey];
  }

  let items = await getCollection([
    `/getCluster/${appId || CMS_DEFAULTS.appId}`,
    "/getCluster",
    `/getClusters/${appId || CMS_DEFAULTS.appId}`,
    "/getClusters",
  ]);

  if (!items.length) {
    items = await scanById(getClusterById);
  }

  items.forEach((item) => upsertLookupEntity("cluster", item));

  const result = mergeWithCache("cluster", items).filter((item) => item.status !== 0);
  LOOKUP_LIST_CACHE[cacheKey] = result;
  return result;
}

export async function listCategories(clusterId, appIdOverride) {
  const appId = appIdOverride || getCurrentCmsAppId();
  const cacheKey = `category:${appId}`;

  if (!LOOKUP_LIST_CACHE[cacheKey]) {
    let items = await getCollection(
      [
        `/getCategory/${appId || CMS_DEFAULTS.appId}`,
        "/getCategory",
        `/getCategories/${appId || CMS_DEFAULTS.appId}`,
        "/getCategories",
      ].filter(Boolean)
    );

    if (!items.length) {
      items = await scanById(getCategoryById);
    }

    items.forEach((item) => upsertLookupEntity("category", item));
    LOOKUP_LIST_CACHE[cacheKey] = mergeWithCache("category", items).filter(
      (item) => item.status !== 0
    );
  }

  const source = LOOKUP_LIST_CACHE[cacheKey] || [];

  return source.filter((item) => {
    if (!clusterId) {
      return true;
    }

    return String(item.cluster_id) === String(clusterId);
  });
}

export async function listSubCategories(clusterId, appIdOverride) {
  const appId = appIdOverride || getCurrentCmsAppId();
  const cacheKey = `subcategory:${appId}`;

  if (!LOOKUP_LIST_CACHE[cacheKey]) {
    let items = await getCollection(
      [
        `/getSubCategory/${appId || CMS_DEFAULTS.appId}`,
        "/getSubCategory",
        `/getSubCategories/${appId || CMS_DEFAULTS.appId}`,
        "/getSubCategories",
      ].filter(Boolean)
    );

    if (!items.length) {
      items = await scanById(getSubCategoryById);
    }

    items.forEach((item) => upsertLookupEntity("subcategory", item));
    LOOKUP_LIST_CACHE[cacheKey] = mergeWithCache("subcategory", items).filter(
      (item) => item.status !== 0
    );
  }

  const source = LOOKUP_LIST_CACHE[cacheKey] || [];

  return source.filter((item) => {
    if (!clusterId) {
      return true;
    }

    return String(item.cluster_id) === String(clusterId);
  });
}
