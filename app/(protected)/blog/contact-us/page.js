"use client";

import "./page.css";
import { useState } from "react";
import FormField from "@/assets/ui/FormField/FormField";
import PdpButton from "@/assets/buttons/button";

export default function ContactUsPage() {

  const initialState = {
    title: "",
    description: "",
    phone: "",
    mapUrl: "",
    email: "",
    address: ""
  };

  const [formData, setFormData] = useState(initialState);

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

  const handleSave = () => {
    console.log("Saved Data:", formData);
  };

  return (
    <section className="contact-page">

      <div className="contact-card">

        {/* HEADER */}

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
            >
              Save
            </PdpButton>

          </div>

        </div>

        {/* FORM GRID */}

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