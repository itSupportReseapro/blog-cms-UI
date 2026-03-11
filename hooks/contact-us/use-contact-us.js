"use client";

import { useState } from "react";

const BASE_URL = "https://dev.api.services.blog.reseapro.com";

export default function useContactUs() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================
  // GET CONTACT BY ID
  // =============================
  const getContactUs = async (id) => {

    if (!id) return null;

    setLoading(true);
    setError(null);

    try {

      const res = await fetch(`${BASE_URL}/getContactUsById/${id}`);

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch contact");
      }

      // API returns array → take first object
      const contact = result?.data?.[0] || null;

      return contact;

    } catch (err) {

      console.error("Get Contact Error:", err);
      setError(err.message);

      return null;

    } finally {

      setLoading(false);

    }

  };

  // =============================
  // CREATE CONTACT
  // =============================
  const createContactUs = async (formData) => {

    setLoading(true);
    setError(null);

    try {

      const payload = {
        app_id: 12,
        user_id: 1,
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
        status: 1,
        created_by: "admin"
      };

      const res = await fetch(`${BASE_URL}/postContactUs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to create contact");
      }

      return result;

    } catch (err) {

      console.error("Create Contact Error:", err);
      setError(err.message);

      return null;

    } finally {

      setLoading(false);

    }

  };

  // =============================
  // UPDATE CONTACT
  // =============================
  const updateContactUs = async (id, formData) => {

    if (!id) return null;

    setLoading(true);
    setError(null);

    try {

      const payload = {
        app_id: 12,
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
        status: 1,
        created_by: "admin"
      };

      const res = await fetch(`${BASE_URL}/putContactUs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update contact");
      }

      return result;

    } catch (err) {

      console.error("Update Contact Error:", err);
      setError(err.message);

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