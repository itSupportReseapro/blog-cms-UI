"use client";

import { useState, useEffect } from "react";
import "./DeleteBlogModal.css";
import Image from "next/image";
import PdpButton from "@/assets/buttons/button";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg"; // adjust path if needed

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
            <Image
              src={CrossIcon}
              alt="close"
              width={12}
              height={12}
            />
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
          <PdpButton
            className="modal-action-btn"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </PdpButton>

          <PdpButton
            className="modal-action-btn modal-action-danger"
            variant="danger"
            onClick={handleConfirm}
          >
            Yes, Delete this Blog
          </PdpButton>

        </div>

      </div>

    </div>
  );
}