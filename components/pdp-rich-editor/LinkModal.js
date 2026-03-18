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
      className="re-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="re-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="re-modal-header">
          <span className="re-modal-title">Insert Link</span>
          <button type="button" className="re-modal-close" onClick={onClose} aria-label="Close link dialog">
            ×
          </button>
        </div>

        <div className="re-modal-body">
          <div className="re-modal-field">
            <label className="re-modal-field__label">URL</label>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUI.href}
              onChange={(e) => onHrefChange(String(e.target.value || ""))}
              placeholder="https://example.com"
              className="re-modal-field__input"
              onKeyDown={(e) => {
                if (e.key === "Enter") onApply();
              }}
            />
          </div>
        </div>

        <div className="re-modal-footer">
          <button type="button" onClick={onRemove} className="re-modal-btn re-modal-btn--cancel">
            Remove
          </button>
          <button type="button" onClick={onClose} className="re-modal-btn re-modal-btn--cancel">
            Close
          </button>
          <button type="button" onClick={onApply} className="re-modal-btn re-modal-btn--insert">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
