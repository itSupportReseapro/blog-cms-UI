"use client";

import { useEffect, useState } from "react";
import { RichEditor, defaultDoc } from "@/components/pdp-rich-editor-2";
import Button from "@/assets/buttons/button";
import useTermAndCondition from "@/hooks/term-and-condition/use-term-and-condition";
import "./term-and-condition.css";

export default function TermsConditionsPage() {
  const [title, setTitle] = useState("");
  const [doc, setDoc] = useState(defaultDoc());
  const { loadTermAndCondition, saveTermAndCondition, loading, error } = useTermAndCondition();

  useEffect(() => {
    let mounted = true;

    async function loadTerms() {
      const nextState = await loadTermAndCondition();

      if (!mounted || !nextState) {
        return;
      }

      setTitle(nextState.title);
      setDoc(nextState.doc);
    }

    loadTerms();

    return () => {
      mounted = false;
    };
  }, []);

  const handleClear = () => {
    setTitle("");
    setDoc(defaultDoc());
  };

  const handleSave = async () => {
    const result = await saveTermAndCondition({ title, doc });

    if (result) {
      window.addSnackbar?.("Terms & Conditions saved successfully!", "success");
    }
  };

  useEffect(() => {
    if (error) {
      window.addSnackbar?.(error, "error");
    }
  }, [error]);

  return (
    <div className="terms-container">

      <div className="terms-header">
        <h2>Terms & Conditions</h2>

        <div className="terms-actions">
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

      <div className="terms-field">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="terms-editor">
        <RichEditor
          value={doc}
          onChange={setDoc}
          className="cms-rich-editor"
          showFooter
          placeholder="Your terms and conditions content goes here..."
        />
      </div>

    </div>
  );
}
