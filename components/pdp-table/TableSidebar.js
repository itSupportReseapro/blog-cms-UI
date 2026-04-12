// components/pdp-table/TableSidebar.js
"use client";

import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";

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
          <button className="pdp-sidebarCloseBtn" type="button" onClick={onClose} aria-label="Close">
            <Image src={CrossIcon} alt="Close" width={18} height={18} />
          </button>
        </div>

        <div className="pdp-sidebarBody">{children}</div>
      </aside>
    </div>
  );
}
