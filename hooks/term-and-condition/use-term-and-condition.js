"use client";

import { useState } from "react";
import { defaultDoc, docToHTML, htmlToDoc } from "@/components/pdp-rich-editor-2";
import {
  CMS_DEFAULTS,
  CMS_RESOURCE_IDS,
  createTermAndCondition,
  getCmsErrorMessage,
  getTermAndConditionById,
  updateTermAndCondition,
} from "@/services/cms.service";

const TERM_AND_CONDITION_STORAGE_KEY = "cms.termAndConditionId";

export default function useTermAndCondition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [termsId, setTermsId] = useState(null);

  const loadTermAndCondition = async () => {
    setLoading(true);
    setError(null);

    try {
      const resolvedId =
        typeof window === "undefined"
          ? CMS_RESOURCE_IDS.termAndCondition
          : window.localStorage.getItem(TERM_AND_CONDITION_STORAGE_KEY) ||
            CMS_RESOURCE_IDS.termAndCondition;

      const terms = await getTermAndConditionById(resolvedId);

      if (!terms) {
        return null;
      }

      setTermsId(terms.id);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(TERM_AND_CONDITION_STORAGE_KEY, String(terms.id));
      }

      return {
        title: terms.title || "",
        doc: terms.description ? htmlToDoc(terms.description) : defaultDoc(),
      };
    } catch (err) {
      console.error("LOAD TERMS ERROR:", err);
      setError(getCmsErrorMessage(err, "Failed to load terms and conditions"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveTermAndCondition = async ({ title, doc }) => {
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

      const result = termsId
        ? await updateTermAndCondition(termsId, updatePayload)
        : await createTermAndCondition(createPayload);

      const nextTermsId = result?.data?.id || termsId;

      if (nextTermsId) {
        setTermsId(nextTermsId);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(TERM_AND_CONDITION_STORAGE_KEY, String(nextTermsId));
        }
      }

      return result;
    } catch (err) {
      console.error("SAVE TERMS ERROR:", err);
      setError(getCmsErrorMessage(err, "Error saving terms and conditions"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loadTermAndCondition,
    saveTermAndCondition,
    loading,
    error,
  };
}
