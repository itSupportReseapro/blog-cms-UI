"use client";

import { useState } from "react";
import {
  CMS_DEFAULTS,
  createContactUs as createContactUsRequest,
  getCmsErrorMessage,
  getContactUsById,
  updateContactUs as updateContactUsRequest,
} from "@/services/cms.service";

export default function useContactUs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getContactUs = async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      return await getContactUsById(id);
    } catch (err) {
      console.error("Get Contact Error:", err);
      setError(getCmsErrorMessage(err, "Failed to fetch contact"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buildCreatePayload = (formData) => ({
    heading: formData.title,
    description: formData.description,
    phone_no: formData.phone,
    email: formData.email,
    address: formData.address,
    map_url: formData.mapUrl,
    logo_url: "",
    obj_1: "",
    obj_2: "",
    obj_3: "",
    obj_4: "",
    obj_5: "",
    status: CMS_DEFAULTS.status,
    created_by: CMS_DEFAULTS.createdBy,
  });

  const buildUpdatePayload = (formData, currentContact = {}) => ({
    app_id: currentContact.app_id || CMS_DEFAULTS.appId,
    heading: formData.title,
    description: formData.description,
    phone_no: formData.phone,
    email: formData.email,
    address: formData.address,
    map_url: formData.mapUrl,
    logo_url: currentContact.logo_url || "",
    obj_1: currentContact.obj_1 || "",
    obj_2: currentContact.obj_2 || "",
    obj_3: currentContact.obj_3 || "",
    obj_4: currentContact.obj_4 || "",
    obj_5: currentContact.obj_5 || "",
    status: currentContact.status || CMS_DEFAULTS.status,
    created_by: currentContact.created_by || CMS_DEFAULTS.createdBy,
  });

  const createContactUs = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      return await createContactUsRequest(buildCreatePayload(formData));
    } catch (err) {
      console.error("Create Contact Error:", err);
      setError(getCmsErrorMessage(err, "Failed to create contact"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContactUs = async (id, formData, currentContact) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      return await updateContactUsRequest(
        id,
        buildUpdatePayload(formData, currentContact)
      );
    } catch (err) {
      console.error("Update Contact Error:", err);
      setError(getCmsErrorMessage(err, "Failed to update contact"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getContactUs,
    createContactUs,
    updateContactUs,
    loading,
    error
  };
}
