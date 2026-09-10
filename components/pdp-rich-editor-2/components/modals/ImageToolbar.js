// ImageToolbar.js
import React from "react";
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon, EditIcon, CancelIcon } from "../icons";

export default function ImageToolbar({ block, onUpdate, onDelete, onClose }) {
  if (!block || block.type !== "image") return null;

  return (
    <div className="re-image-toolbar" onClick={(e) => e.stopPropagation()}>
      <div className="re-image-toolbar__group">
        <button
          type="button"
          className={["re-image-toolbar__btn", block.align === "left" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => onUpdate({ align: "left" })}
          title="Align Left"
        >
          <AlignLeftIcon /> Left
        </button>
        <button
          type="button"
          className={["re-image-toolbar__btn", block.align === "center" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => onUpdate({ align: "center" })}
          title="Align Center"
        >
          <AlignCenterIcon /> Center
        </button>
        <button
          type="button"
          className={["re-image-toolbar__btn", block.align === "right" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => onUpdate({ align: "right" })}
          title="Align Right"
        >
          <AlignRightIcon /> Right
        </button>
      </div>

      <div className="re-image-toolbar__divider" />

      <div className="re-image-toolbar__group">
        <button
          type="button"
          className="re-image-toolbar__btn"
          onClick={() => onUpdate({ width: Math.max(120, (block.width || 600) - 100) })}
          title="Decrease Size"
        >
          - Size
        </button>
        <span className="re-image-toolbar__info">{block.width || 600}px</span>
        <button
          type="button"
          className="re-image-toolbar__btn"
          onClick={() => onUpdate({ width: Math.min(1200, (block.width || 600) + 100) })}
          title="Increase Size"
        >
          + Size
        </button>
      </div>

      <div className="re-image-toolbar__divider" />

      <button
        type="button"
        className="re-image-toolbar__btn re-image-toolbar__btn--danger"
        onClick={onDelete}
        title="Delete Image"
      >
        <CancelIcon /> Delete
      </button>
    </div>
  );
}
