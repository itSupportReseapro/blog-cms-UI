"use client";

import { useState } from "react";
import PdpButton from "@/assets/buttons/button";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import CmsTimeline from "@/components/timeline/timeline";
import "./create-blog.css";
import RichTextEditor from "@/components/richtext/richtext";

export default function CreateBlog() {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cover: null,
    group: "",
    category: "",
    subcategory: "",
    country: "",
    state: "",
    district: "",
    city: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="create-blog-wrapper">

      {/* TOP HEADER */}

      <div className="create-blog-top">

        <div className="left-section">
          {step === 2 && (
            <PdpButton variant="ghost" size="sm" onClick={() => setStep(1)}>
              ← Create Blog
            </PdpButton>
          )}
        </div>

        <div className="right-section">

          {step === 2 && (
            <PdpButton variant="outline" size="sm" onClick={() => setStep(1)}>
              ← Back
            </PdpButton>
          )}

          <PdpButton variant="outline" size="sm">
            Save as draft
          </PdpButton>

          {step === 1 && (
            <PdpButton variant="primary" size="sm" onClick={() => setStep(2)}>
              Next →
            </PdpButton>
          )}

          {step === 2 && (
            <PdpButton variant="primary" size="sm">
              Create
            </PdpButton>
          )}

        </div>
      </div>


      <CmsTimeline currentStep={step} />


      {/* STEP 1 */}

      {step === 1 && (
        <div className="step-one">

          {/* TITLE */}

          <PdpTextbox1
            label="Blog Title"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
          />


          {/* SUBTITLE + COVER */}

          <div className="grid-2">

            <PdpTextbox1
              label="Blog Subtitle"
              name="subtitle"
              id="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
            />

            <div className="cover-field">

              <PdpTextbox1
                label="Blog Cover Image"
                type="file"
                name="cover"
                id="cover"
                onChange={handleChange}
              />

              <span className="helper-text">
                Accepted formats: JPEG, SVG, & WEBP • Max size: 2MB
              </span>

            </div>

          </div>


          {/* CONTENT CLASSIFICATION */}

          <div className="section">

            <h3 className="section-title">
              Content Classification
            </h3>

            <p className="section-desc">
              Organize this blog using group, category, and subcategory.
            </p>

            <div className="grid-3">

              <PdpTextbox1
                label="Group"
                name="group"
                id="group"
                value={formData.group}
                onChange={handleChange}
              />

              <PdpTextbox1
                label="Category"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
              />

              <PdpTextbox1
                label="Subcategory"
                name="subcategory"
                id="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
              />

            </div>

          </div>


          <div className="divider" />


          {/* LOCATION */}

          <div className="section">

            <h3 className="section-title">
              Location Classification
            </h3>

            <p className="section-desc">
              Organize this blog using country, state, district, and city.
            </p>

            <div className="grid-2">

              <PdpTextbox1
                label="Country"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
              />

              <PdpTextbox1
                label="State"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
              />

              <PdpTextbox1
                label="District"
                name="district"
                id="district"
                value={formData.district}
                onChange={handleChange}
              />

              <PdpTextbox1
                label="City"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>
      )}


      {/* STEP 2 */}

      {step === 2 && (

        <div className="step-two">

          <RichTextEditor
            value={formData.content}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                content: val,
              }))
            }
          />

        </div>

      )}

    </div>
  );
}