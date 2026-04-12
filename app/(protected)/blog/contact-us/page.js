"use client";

import "./page.css";
import { useState, useEffect } from "react";
import FormField from "@/assets/FormField/FormField";
import PdpButton from "@/assets/buttons/button";
import useContactUs from "@/hooks/contact-us/use-contact-us";
import { CMS_RESOURCE_IDS } from "@/services/cms.service";

const CONTACT_US_STORAGE_KEY = "cms.contactUsId";
const LEGACY_CONTACT_US_STORAGE_KEY = "contactId";

export default function ContactUsPage() {
  const { getContactUs, createContactUs, updateContactUs, loading, error } = useContactUs();

  const initialState = {
    title: "",
    description: "",
    phone: "",
    mapUrl: "",
    email: "",
    address: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [contactId, setContactId] = useState(null);
  const [contactRecord, setContactRecord] = useState(null);

  const persistContactId = (id) => {
    if (typeof window === "undefined" || !id) return;
    window.localStorage.setItem(CONTACT_US_STORAGE_KEY, String(id));
    window.localStorage.setItem(LEGACY_CONTACT_US_STORAGE_KEY, String(id));
  };

  const resolveContactId = () => {
    if (typeof window === "undefined") {
      return CMS_RESOURCE_IDS.contactUs;
    }

    return (
      window.localStorage.getItem(CONTACT_US_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_CONTACT_US_STORAGE_KEY) ||
      CMS_RESOURCE_IDS.contactUs
    );
  };

  const getExistingContact = async (preferredId) => {
    const candidateIds = [preferredId, CMS_RESOURCE_IDS.contactUs]
      .filter(Boolean)
      .map((id) => String(id));

    const uniqueIds = [...new Set(candidateIds)];

    for (const id of uniqueIds) {
      const contact = await getContactUs(id);

      if (contact?.id) {
        return contact;
      }
    }

    return null;
  };

  useEffect(() => {
    loadContact(resolveContactId());
  }, []);

  const loadContact = async (id) => {
    const contact = await getExistingContact(id);

    if (!contact) {
      setContactId(null);
      setContactRecord(null);
      setFormData(initialState);
      return;
    }

    setContactId(contact.id);
    setContactRecord(contact);
    persistContactId(contact.id);

    setFormData({
      title: contact.heading || "",
      description: contact.description || "",
      phone: contact.phone_no || "",
      mapUrl: contact.map_url || "",
      email: contact.email || "",
      address: contact.address || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData(initialState);
  };

  const handleSave = async () => {
    const resolvedId = contactId || resolveContactId();
    const existingContact = contactRecord || (await getExistingContact(resolvedId));

    let res;

    if (existingContact?.id) {
      res = await updateContactUs(existingContact.id, formData, existingContact);
    } else {
      res = await createContactUs(formData);
    }

    if (res?.success || res?.data) {
      const nextId = res?.data?.id || existingContact?.id || resolveContactId();
      await loadContact(nextId);
    }
  };

  useEffect(() => {
    if (error) {
      window.addSnackbar(error, "error");
    }
  }, [error]);

  return (
    <section className="contact-page">

      <div className="contact-card">

        <div className="contact-header">

          <h2>Contact Us</h2>

          <div className="header-actions">

            <PdpButton
              variant="outline"
              size="md"
              radius="sm"
              onClick={handleClear}
            >
              Clear All
            </PdpButton>

            <PdpButton
              variant="primary"
              size="md"
              radius="sm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </PdpButton>

          </div>

        </div>

        <div className="form-grid">

          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          <FormField
            label="Description"
            name="description"
            textarea
            value={formData.description}
            onChange={handleChange}
          />

          <div className="section-title">
            Contact Details
          </div>

          <FormField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <FormField
            label="Map URL"
            name="mapUrl"
            value={formData.mapUrl}
            onChange={handleChange}
          />

          <FormField
            label="E-mail Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <FormField
            label="Address"
            name="address"
            textarea
            large
            value={formData.address}
            onChange={handleChange}
          />

        </div>

      </div>

    </section>
  );
}
