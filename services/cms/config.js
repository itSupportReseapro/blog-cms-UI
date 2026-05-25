import { DEFAULT_BLOG_APP_ID, getCurrentBlogAppId } from "@/lib/blogAppContext";

const rawEnv = String(process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development")
  .trim()
  .toLowerCase();

const ENV_ALIASES = {
  dev: "development",
  development: "development",
  tst: "test",
  test: "test",
  qa: "test",
  staging: "test",
  prod: "production",
  production: "production",
};

const ENV = ENV_ALIASES[rawEnv] || "development";

const CMS_BASE_MAP = {
  development:
    process.env.NEXT_PUBLIC_DEV_CMS_API_BASE_URL || "https://dev.api.services.blog.reseapro.com",
  test:
    process.env.NEXT_PUBLIC_TEST_CMS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_DEV_CMS_API_BASE_URL ||
    "https://dev.api.services.blog.reseapro.com",
  production:
    process.env.NEXT_PUBLIC_PROD_CMS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_DEV_CMS_API_BASE_URL ||
    "https://dev.api.services.blog.reseapro.com",
};

export const CMS_BASE_URL = CMS_BASE_MAP[ENV] || process.env.NEXT_PUBLIC_CMS_API_BASE_URL || "";

export const BLOG_DROPDOWN_LIST_PATH =
  process.env.NEXT_PUBLIC_BLOG_DROPDOWN_LIST_PATH || "/getBlogDropdownOptions";

export const BLOG_DROPDOWN_CREATE_PATH =
  process.env.NEXT_PUBLIC_BLOG_DROPDOWN_CREATE_PATH || "/postBlogDropdownOption";

const LOCATION_BASE_MAP = {
  development:
    process.env.NEXT_PUBLIC_DEV_LOCATION_API_BASE_URL ||
    "https://dev.services.location.reseapro.com/api/location",
  test:
    process.env.NEXT_PUBLIC_TEST_LOCATION_API_BASE_URL ||
    process.env.NEXT_PUBLIC_DEV_LOCATION_API_BASE_URL ||
    "https://dev.services.location.reseapro.com/api/location",
  production:
    process.env.NEXT_PUBLIC_PROD_LOCATION_API_BASE_URL ||
    process.env.NEXT_PUBLIC_DEV_LOCATION_API_BASE_URL ||
    "https://dev.services.location.reseapro.com/api/location",
};

const LOCATION_BASE_URL =
  LOCATION_BASE_MAP[ENV] || "https://dev.services.location.reseapro.com/api/location";

export const LOCATION_COUNTRIES_URL =
  process.env.NEXT_PUBLIC_LOCATION_COUNTRIES_API || `${LOCATION_BASE_URL}/countries`;

export const LOCATION_STATES_URL =
  process.env.NEXT_PUBLIC_LOCATION_STATES_API || `${LOCATION_BASE_URL}/states`;

export const LOCATION_DISTRICTS_URL =
  process.env.NEXT_PUBLIC_LOCATION_DISTRICTS_API || `${LOCATION_BASE_URL}/districts`;

export const LOCATION_CITIES_URL =
  process.env.NEXT_PUBLIC_LOCATION_CITIES_API || `${LOCATION_BASE_URL}/cities`;

export const LOOKUP_SCAN_MAX = Number(process.env.NEXT_PUBLIC_CMS_LOOKUP_SCAN_MAX || 120);
export const LOOKUP_SCAN_MISS_LIMIT = Number(process.env.NEXT_PUBLIC_CMS_LOOKUP_SCAN_MISS_LIMIT || 8);

export const UPLOAD_BASE_MAP = {
  development: process.env.NEXT_PUBLIC_DEV_UPLOAD_API || "https://dev.upload.reseapro.com",
  test:
    process.env.NEXT_PUBLIC_TEST_UPLOAD_API ||
    "https://tst.upload.reseapro.com",
  production:
    process.env.NEXT_PUBLIC_PROD_UPLOAD_API ||
    "https://upload.reseapro.com",
};

export const UPLOAD_DOMAIN_MAP = {
  development: process.env.NEXT_PUBLIC_DEV_UPLOAD_DOMAIN || "dev.pubmanu.com",
  test: process.env.NEXT_PUBLIC_TEST_UPLOAD_DOMAIN || "tst.pubmanu.com",
  production: process.env.NEXT_PUBLIC_PROD_UPLOAD_DOMAIN || "pubmanu.com",
};

export const ENV_KEY = ENV;

export const CMS_DEFAULTS = {
  appId: DEFAULT_BLOG_APP_ID,
  userId: 1,
  status: 1,
  createdBy: "admin",
};

export function getCurrentCmsAppId() {
  return getCurrentBlogAppId();
}

export const CMS_RESOURCE_IDS = {
  contactUs: 19,
  aboutUs: 2,
  aboutUsMissionVision: 2,
  aboutUsOurValues: 3,
  privacyPolicy: 1,
  termAndCondition: 1,
};
