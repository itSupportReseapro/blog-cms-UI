"use client";

import { useState } from "react";
import { RichEditor, defaultDoc } from "@/components/pdp-rich-editor";
import Button from "@/assets/buttons/button";
import "./term-and-condition.css";

export default function TermsConditionsPage() {

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

      console.log("SAVE TERMS & CONDITIONS ↓↓↓");
      console.log(payload);

      const res = await fetch("/api/terms-conditions", {
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

      alert("Terms & Conditions saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Error saving terms & conditions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terms-container">

      {/* Header */}
      <div className="terms-header">
        <h2>Terms & Conditions</h2>

        <div className="terms-actions">
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
      <div className="terms-field">
        <label>Title</label>

        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Rich Editor */}
      <div className="terms-editor">
        <RichEditor
          value={doc}
          onChange={setDoc}
          placeholder="Your terms and conditions content goes here..."
        />
      </div>

    </div>
  );
}