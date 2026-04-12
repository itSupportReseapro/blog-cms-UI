"use client";

import { useState } from "react";
import { defaultDoc, docToHTML, htmlToDoc } from "@/components/pdp-rich-editor";
import {
  CMS_DEFAULTS,
  CMS_RESOURCE_IDS,
  createPrivacyPolicy,
  getCmsErrorMessage,
  getPrivacyPolicyById,
  updatePrivacyPolicy,
} from "@/services/cms.service";

const PRIVACY_POLICY_STORAGE_KEY = "cms.privacyPolicyId";

export default function usePrivacyPolicy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [policyId, setPolicyId] = useState(null);

  const loadPrivacyPolicy = async () => {
    setLoading(true);
    setError(null);

    try {
      const resolvedId =
        typeof window === "undefined"
          ? CMS_RESOURCE_IDS.privacyPolicy
          : window.localStorage.getItem(PRIVACY_POLICY_STORAGE_KEY) || CMS_RESOURCE_IDS.privacyPolicy;

      const policy = await getPrivacyPolicyById(resolvedId);

      if (!policy) {
        return null;
      }

      setPolicyId(policy.id);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(PRIVACY_POLICY_STORAGE_KEY, String(policy.id));
      }

      return {
        title: policy.title || "",
        doc: policy.description ? htmlToDoc(policy.description) : defaultDoc(),
      };
    } catch (err) {
      console.error("LOAD PRIVACY POLICY ERROR:", err);
      setError(getCmsErrorMessage(err, "Failed to load privacy policy"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const savePrivacyPolicy = async ({ title, doc }) => {
    setLoading(true);
    setError(null);

    try {
      const createPayload = {
        app_id: CMS_DEFAULTS.appId,
        user_id: CMS_DEFAULTS.userId,
        title,
        description: docToHTML(doc),
        obj_1: "",
        obj_2: "",
        obj_3: "",
        obj_4: "",
        obj_5: "",
        status: CMS_DEFAULTS.status,
        created_by: CMS_DEFAULTS.createdBy,
      };

      const updatePayload = {
        title,
        description: docToHTML(doc),
      };

      const result = policyId
        ? await updatePrivacyPolicy(policyId, updatePayload)
        : await createPrivacyPolicy(createPayload);

      const nextPolicyId = result?.data?.id || policyId;

      if (nextPolicyId) {
        setPolicyId(nextPolicyId);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(PRIVACY_POLICY_STORAGE_KEY, String(nextPolicyId));
        }
      }

      return result;
    } catch (err) {
      console.error("SAVE PRIVACY POLICY ERROR:", err);
      setError(getCmsErrorMessage(err, "Error saving policy"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loadPrivacyPolicy,
    savePrivacyPolicy,
    loading,
    error,
  };
}