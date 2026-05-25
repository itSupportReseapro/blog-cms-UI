export const LOOKUP_CACHE = {
  cluster: new Map(),
  category: new Map(),
  subcategory: new Map(),
};

export const LOOKUP_LIST_CACHE = {
  cluster: null,
  category: null,
  subcategory: null,
};

export const DROPDOWN_OPTIONS_CACHE = new Map();
export const REMOTE_DROPDOWN_UNSUPPORTED_FIELDS = new Set();

export function upsertLookupEntity(type, entity) {
  if (!entity?.id || !LOOKUP_CACHE[type]) {
    return;
  }

  LOOKUP_CACHE[type].set(String(entity.id), entity);
}

export function mergeWithCache(type, items) {
  const cacheItems = Array.from((LOOKUP_CACHE[type] || new Map()).values());
  const mergedById = new Map();

  [...cacheItems, ...items].forEach((item) => {
    if (!item?.id) {
      return;
    }

    mergedById.set(String(item.id), item);
  });

  return Array.from(mergedById.values());
}

export function createDropdownCacheKey(field, params = {}) {
  const normalizedParams = Object.keys(params || {})
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return JSON.stringify({ field, params: normalizedParams });
}

export function clearDropdownCache(field) {
  if (!field) {
    DROPDOWN_OPTIONS_CACHE.clear();
    return;
  }

  for (const key of DROPDOWN_OPTIONS_CACHE.keys()) {
    if (key.includes(`"field":"${field}"`)) {
      DROPDOWN_OPTIONS_CACHE.delete(key);
    }
  }
}

export function clearLookupListCache(type) {
  if (!type) {
    Object.keys(LOOKUP_LIST_CACHE).forEach((key) => {
      LOOKUP_LIST_CACHE[key] = null;
    });
    return;
  }

  Object.keys(LOOKUP_LIST_CACHE).forEach((key) => {
    if (key === type || key.startsWith(`${type}:`)) {
      LOOKUP_LIST_CACHE[key] = null;
    }
  });
}
