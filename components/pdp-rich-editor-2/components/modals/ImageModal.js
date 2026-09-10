// ImageModal.js
import React, { useState } from "react";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function validateImage(file) {
  if (!file) throw new Error("No file selected");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported image format. Please select JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be smaller than 10 MB.");
  }
}

export default function ImageModal({ open, onClose, onSubmit, onUploadImage }) {
  const [tab, setTab] = useState("file"); // "file" | "url"
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [width, setWidth] = useState(600);
  const [align, setAlign] = useState("center");
  const [wrap, setWrap] = useState("break-text");

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (tab === "file") {
      if (!file) {
        setError("Please choose an image file to upload.");
        return;
      }

      try {
        validateImage(file);
        setUploading(true);

        let result = null;
        if (typeof onUploadImage === "function") {
          result = await onUploadImage(file);
        } else {
          // Fallback: create object URL if no custom upload handler provided
          const objectUrl = URL.createObjectURL(file);
          result = { src: objectUrl, width: 600 };
        }

        onSubmit({
          src: result.src,
          id: result.id,
          alt,
          caption,
          width: Number(width) || result.width || 600,
          align,
          wrap,
        });

        resetForm();
        onClose();
      } catch (err) {
        setError(err.message || "Failed to process image file.");
      } finally {
        setUploading(false);
      }
    } else {
      if (!url.trim()) {
        setError("Please enter a valid image URL.");
        return;
      }

      onSubmit({
        src: url.trim(),
        alt,
        caption,
        width: Number(width) || 600,
        align,
        wrap,
      });

      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFile(null);
    setUrl("");
    setAlt("");
    setCaption("");
    setWidth(600);
    setAlign("center");
    setWrap("break-text");
    setError("");
  };

  return (
    <div className="re-modal-overlay" onClick={onClose}>
      <div className="re-modal" onClick={(e) => e.stopPropagation()}>
        <div className="re-modal__header">
          <h3>Insert Image</h3>
          <button type="button" className="re-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="re-modal__body">
            {error && <div className="re-modal__error">{error}</div>}

            <div className="re-modal__tabs">
              <button
                type="button"
                className={["re-modal__tab", tab === "file" ? "is-active" : ""].filter(Boolean).join(" ")}
                onClick={() => setTab("file")}
              >
                Upload File
              </button>
              <button
                type="button"
                className={["re-modal__tab", tab === "url" ? "is-active" : ""].filter(Boolean).join(" ")}
                onClick={() => setTab("url")}
              >
                Image URL
              </button>
            </div>

            {tab === "file" ? (
              <div className="re-form-group">
                <label>Choose File (Max 10MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      setFile(selected);
                      setError("");
                    }
                  }}
                />
                {file && <span className="re-form-hint">{file.name} ({Math.round(file.size / 1024)} KB)</span>}
              </div>
            ) : (
              <div className="re-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            <div className="re-form-group">
              <label>Alternative Text (Alt)</label>
              <input
                type="text"
                placeholder="Description for accessibility"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>

            <div className="re-form-group">
              <label>Caption</label>
              <input
                type="text"
                placeholder="Figure caption text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="re-form-row">
              <div className="re-form-group re-form-group--half">
                <label>Width (px)</label>
                <input
                  type="number"
                  min="80"
                  max="1600"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>

              <div className="re-form-group re-form-group--half">
                <label>Alignment</label>
                <select value={align} onChange={(e) => setAlign(e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          <div className="re-modal__footer">
            <button type="button" className="re-btn re-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="re-btn re-btn--primary" disabled={uploading}>
              {uploading ? "Uploading..." : "Insert Image"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
