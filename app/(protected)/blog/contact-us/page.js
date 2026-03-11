"use client";

import "./page.css";
import { useState, useEffect } from "react";
import FormField from "@/assets/ui/FormField/FormField";
import PdpButton from "@/assets/buttons/button";
import useContactUs from "@/hooks/contact-us/use-contact-us";

export default function ContactUsPage() {

  const { getContactUs, createContactUs, updateContactUs, loading } = useContactUs();

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

  // ============================
  // LOAD CONTACT ID FROM STORAGE
  // ============================
  useEffect(() => {

    const storedId = localStorage.getItem("contactId");

    if (!storedId) return; // do nothing if no id

    setContactId(storedId);

    loadContact(storedId);

  }, []);

  // ============================
  // LOAD CONTACT DATA
  // ============================
  const loadContact = async (id) => {

    const contact = await getContactUs(id);

    if (!contact) return;

    setFormData({
      title: contact.heading || "",
      description: contact.description || "",
      phone: contact.phone_no || "",
      mapUrl: contact.map_url || "",
      email: contact.email || "",
      address: contact.address || ""
    });

  };

  // ============================
  // HANDLE INPUT
  // ============================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  // ============================
  // CLEAR
  // ============================
  const handleClear = () => {

    setFormData(initialState);

  };

  // ============================
  // SAVE
  // ============================
  const handleSave = async () => {

    let res;

    if (contactId) {

      res = await updateContactUs(contactId, formData);

    } else {

      res = await createContactUs(formData);

      if (res?.data?.id) {

        const newId = res.data.id;

        setContactId(newId);

        localStorage.setItem("contactId", newId);

        // immediately load the saved contact
        loadContact(newId);

      }

    }

  };

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