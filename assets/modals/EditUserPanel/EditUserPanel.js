"use client";

import "./EditUserPanel.css";
import Image from "next/image";

import editUserIcon from "@/assets/Images/icon/edit-user-icon.svg";
import crossIcon from "@/assets/Images/icon/cross-icon.svg";

/* avatar icon */
import profileAvatar from "@/assets/Images/icon/Profile-avatar.svg";

export default function EditUserPanel({ onClose, onCancel }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="user-panel edit-mode expand-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <h3>Edit User Details</h3>

          <button className="close-btn" onClick={onClose}>
            <Image src={crossIcon} alt="Close" width={14} height={14} />
          </button>
        </div>

        <div className="avatar-section">
          <div className="avatar-wrapper">

            {/* BIG avatar */}
            <div className="avatar-circle">
              <Image
                src={profileAvatar}
                alt="Avatar"
                width={70}
                height={70}
              />
            </div>

            {/* small edit icon */}
            <button className="edit-avatar-btn">
              <Image src={editUserIcon} alt="Edit" width={34} height={34} />
            </button>

          </div>

          <div className="form-section">
            <input className="input-field" placeholder="Full Name" />
            <input className="input-field" placeholder="E-mail Address" />
            <input className="input-field" placeholder="Phone Number" />
          </div>

          <div className="panel-buttons">
            <button className="btn-outline" onClick={onCancel}>
              Cancel
            </button>

            <button className="btn-primary">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}