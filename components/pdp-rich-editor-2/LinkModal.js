"use client";
import { useEffect } from "react";

export default function LinkModal({ linkUI, linkInputRef, onHrefChange, onApply, onRemove, onClose }) {
  useEffect(() => {
    if (linkUI.open) {
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [linkUI.open, linkInputRef]);

  if (!linkUI.open) return null;

  return (
    <div
      className="re-link-pop"
      style={{ left: linkUI.x, top: linkUI.y }}
      onMouseDownCapture={(event) => {
        if (event.target.tagName === "INPUT") {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }}
    >
      <div className="re-link-pop__header">
        <span className="re-link-pop__title">Add hyperlink</span>
        <button type="button" className="re-link-pop__close" onClick={onClose} aria-label="Close link popup">
          ×
        </button>
      </div>

      <div className="re-link-row">
        <input
          ref={linkInputRef}
          type="url"
          value={linkUI.href}
          onChange={(e) => onHrefChange(String(e.target.value || ""))}
          placeholder="https://example.com"
          className="re-link-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
            if (e.key === "Escape") onClose();
          }}
        />
        <button type="button" onClick={onApply} className="re-link-apply-btn">
          Apply
        </button>
      </div>

      <div className="re-link-actions">
        <button type="button" onClick={onRemove} className="re-link-secondary-btn">
          Remove
        </button>
        <button type="button" onClick={onClose} className="re-link-secondary-btn">
          Close
        </button>
      </div>
    </div>
  );
}
