"use client";

import { useState } from "react";
import { RichEditor, defaultDoc } from "@/components/pdp-rich-editor"; // ✅ fixed import
import Button from "@/assets/buttons/button";
import "./page.css";

export default function PrivacyPolicyPage() {

  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState(defaultDoc());
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setTitle("");
    setDoc(defaultDoc());
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        title,
        doc,
      };

      console.log("SAVE PRIVACY POLICY ↓↓↓");
      console.log(payload);

      const res = await fetch("/api/privacy-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Save failed");
        return;
      }

      alert("Privacy Policy saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Error saving policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="privacy-container">

      {/* Header */}
      <div className="privacy-header">
        <h2>Privacy Policy</h2>

        <div className="privacy-actions">
          <Button
            variant="secondary"
            onClick={handleClear}
            disabled={loading}
          >
            Clear All
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="privacy-field">
        <label>Title</label>

        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Rich Editor */}
      <div className="privacy-editor">
        <RichEditor
          value={doc}
          onChange={setDoc}
          placeholder="Your privacy policy content goes here..."
        />
      </div>

    </div>
  );
}