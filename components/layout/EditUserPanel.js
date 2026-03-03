"use client";

import Image from "next/image";
import editUserIcon from "@/assets/Images/icon/edit-user-icon.svg";

export default function EditUserPanel({ onClose, onCancel }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="user-panel edit-mode" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Edit User Details</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-circle"></div>
            <button className="edit-avatar-btn">
              <Image src={editUserIcon} alt="Edit" />
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