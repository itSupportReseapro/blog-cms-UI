import { useEffect } from "react";

export default function LinkPopup({
  linkUI,
  linkInputRef,
  onHrefChange,
  onApply,
  onRemove,
  onClose,
}) {
  useEffect(() => {
    if (linkUI.open) {
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [linkUI.open, linkInputRef]);

  if (!linkUI.open) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: linkUI.x,
        top: linkUI.y,
      }}
      className="re-link-pop"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="re-link-row">
        <input
          ref={linkInputRef}
          value={linkUI.href}
          onChange={(e) => onHrefChange(String(e.target.value || ""))}
          placeholder="https://example.com"
          className="re-link-input"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onApply}
          className="re-link-apply-btn"
        >
          Apply
        </button>
      </div>

      <div className="re-link-actions">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRemove}
          className="re-link-secondary-btn"
        >
          Remove
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          className="re-link-secondary-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
}
