"use client";

import "./page.css";
import { useState } from "react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phone: "",
    mapUrl: "",
    email: "",
    address: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      phone: "",
      mapUrl: "",
      email: "",
      address: ""
    });
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
            <button className="btn-outline" onClick={handleClear}>
              Clear All
            </button>

            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="form-grid">

          {/* LEFT COLUMN */}
          <div className="left-column">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
            />

            <h4 className="section-title">Contact Details</h4>

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="email"
              placeholder="E-mail Address"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            <textarea
              name="description"
              placeholder="Description"
              className="textarea-field"
              value={formData.description}
              onChange={handleChange}
            />

            <input
              type="text"
              name="mapUrl"
              placeholder="Map URL"
              className="input-field"
              value={formData.mapUrl}
              onChange={handleChange}
            />

            <textarea
              name="address"
              placeholder="Address"
              className="textarea-field"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

        </div>

      </div>
    </section>
  );
}