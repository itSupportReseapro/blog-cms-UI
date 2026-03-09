"use client";

import { useState, useEffect } from "react";
import "./DeleteBlogModal.css";

export default function DeleteBlogModal({
  isOpen,
  blogTitle,
  onClose,
  onConfirm
}) {

  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {

    if (inputValue.trim() !== blogTitle) {
      setError("Blog name does not match.");
      return;
    }

    setError("");
    onConfirm();
  };

  return (
    <div className="modal-overlay">

      <div className="delete-modal">

        {/* HEADER */}

        <div className="modal-header">

          <h2>Delete Blog</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* DESCRIPTION */}

        <p className="modal-description">
          Are you sure you want to delete this blog? This action cannot be
          undone. The blog and all its associated content will be permanently
          removed.
        </p>

        {/* INPUT */}

        <input
          className={`delete-input ${error ? "input-error" : ""}`}
          placeholder="Please type the blog name to confirm"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
        />

        {error && (
          <span className="error-text">{error}</span>
        )}

        {/* BUTTONS */}

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleConfirm}
          >
            Yes, Delete this Blog
          </button>

        </div>

      </div>

    </div>
  );
}