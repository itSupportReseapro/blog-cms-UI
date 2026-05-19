"use client";

import { useEffect, useState } from "react";
import { RichEditor, defaultDoc } from "@/components/pdp-rich-editor-2";
import Button from "@/assets/buttons/button";
import usePrivacyPolicy from "@/hooks/privacy-policy/use-privacy-policy";
import "./page.css";

export default function PrivacyPolicyPage() {
  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState(defaultDoc());
  const { loadPrivacyPolicy, savePrivacyPolicy, loading, error } = usePrivacyPolicy();

  useEffect(() => {
    let mounted = true;

    async function loadPolicy() {
      const nextState = await loadPrivacyPolicy();

      if (!mounted || !nextState) {
        return;
      }

      setTitle(nextState.title);
      setDoc(nextState.doc);
    }

    loadPolicy();

    return () => {
      mounted = false;
    };
  }, []);

  const handleClear = () => {
    setTitle("");
    setDoc(defaultDoc());
  };

  const handleSave = async () => {
    const result = await savePrivacyPolicy({ title, doc });

    if (result) {
      window.addSnackbar?.("Privacy Policy saved successfully!", "success");
    }
  };

  useEffect(() => {
    if (error) {
      window.addSnackbar?.(error, "error");
    }
  }, [error]);

  return (
    <div className="privacy-container">

      <div className="privacy-header">
        <h2>Privacy Policy</h2>

        <div className="privacy-actions">
          <Button
            variant="outline"
            radius="sm"
            onClick={handleClear}
            disabled={loading}
          >
            Clear All
          </Button>

          <Button
            variant="primary"
            radius="sm"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="privacy-field">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="privacy-editor">
        <RichEditor
          value={doc}
          onChange={setDoc}
          className="cms-rich-editor"
          showFooter
          placeholder="Your privacy policy content goes here..."
        />
      </div>

    </div>
  );
}
