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
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <PdpTextbox1
            label="Blog Title"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid-2">
            <PdpTextbox1
              label="Blog Subtitle"
              name="subtitle"
              id="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
            />

            <PdpTextbox1
              label="Blog Cover Image"
              type="file"
              name="cover"
              id="cover"
              value={formData.cover}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <PdpTextbox1
              label="Blog Subtitle"
              name="subtitle"
              id="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
            />

            <PdpTextbox1
              label="Blog Cover Image"
              type="file"
              name="cover"
              id="cover"
              value={formData.cover}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="step-two">
          <RichTextEditor
            value={formData.content}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, content: val }))
            }
          />
        </div>
      )}
    </div>
  );
}
