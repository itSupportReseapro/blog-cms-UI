import { CMS_DEFAULTS } from "./config";
import { getSingle, postResource, putResource } from "./http";

export function getContactUsById(id) {
  return getSingle(`/getContactUsById/${id}`, "Failed to fetch contact us");
}

export function createContactUs(payload) {
  const appId = payload?.app_id || CMS_DEFAULTS.appId;
  return postResource(`/postContactUs/${appId}`, payload, "Failed to create contact us");
}

export function updateContactUs(id, payload) {
  return putResource(`/putContactUs/${id}`, payload, "Failed to update contact us");
}

export function getAboutUsById(id) {
  const appId = id || CMS_DEFAULTS.appId;
  return getSingle(`/getAboutUs/${appId}`, "Failed to fetch about us");
}

export function createAboutUs(payload) {
  return postResource("/postAboutUs", payload, "Failed to create about us");
}

export function updateAboutUs(id, payload) {
  return putResource(`/putAboutUs/${id}`, payload, "Failed to update about us");
}

export function getAboutUsMissionAndVisionById(id) {
  const appId = id || CMS_DEFAULTS.appId;
  return getSingle(
    `/getAboutUsMissionAndVision/${appId}`,
    "Failed to fetch about us mission and vision"
  );
}

export function createAboutUsMissionAndVision(payload) {
  return postResource(
    "/postAboutUsMissionAndVision",
    payload,
    "Failed to create about us mission and vision"
  );
}

export function updateAboutUsMissionAndVision(id, payload) {
  return putResource(
    `/putAboutUsMissionAndVision/${id}`,
    payload,
    "Failed to update about us mission and vision"
  );
}

export function getAboutUsOurValuesById(id) {
  const appId = id || CMS_DEFAULTS.appId;
  return getSingle(`/getAboutUsOurValues/${appId}`, "Failed to fetch about us values");
}

export function createAboutUsOurValues(payload) {
  return postResource("/postAboutUsOurValues", payload, "Failed to create about us values");
}

export function updateAboutUsOurValues(id, payload) {
  return putResource(`/putAboutUsOurValues/${id}`, payload, "Failed to update about us values");
}

export function getPrivacyPolicyById(id) {
  return getSingle(`/getPrivacyPolicyById/${id}`, "Failed to fetch privacy policy");
}

export function createPrivacyPolicy(payload) {
  return postResource("/postPrivacyPolicy", payload, "Failed to create privacy policy");
}

export function updatePrivacyPolicy(id, payload) {
  return putResource(`/putPrivacyPolicy/${id}`, payload, "Failed to update privacy policy");
}

export function getTermAndConditionById(id) {
  return getSingle(`/getTermAndConditionById/${id}`, "Failed to fetch terms and conditions");
}

export function createTermAndCondition(payload) {
  return postResource("/postTermAndCondition", payload, "Failed to create terms and conditions");
}

export function updateTermAndCondition(id, payload) {
  return putResource(
    `/putTermAndCondition/${id}`,
    payload,
    "Failed to update terms and conditions"
  );
}
