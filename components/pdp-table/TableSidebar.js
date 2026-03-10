// components/pdp-table/TableSidebar.js
"use client";

export default function TableSidebar({ open, onClose, title = "Controls", children }) {
  if (!open) return null;

  return (
    <div className="pdp-sidebarBackdrop" onMouseDown={onClose}>
      <aside
        className="pdp-sidebar"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pdp-sidebarHeader">
          <div className="pdp-sidebarHeaderTitle">{title}</div>
          <button className="pdp-iconBtn" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pdp-sidebarBody">{children}</div>
      </aside>
    </div>
  );
}
