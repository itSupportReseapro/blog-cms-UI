"use client";

import "./EditUserPanel.css";
import Image from "next/image";
import PdpButton from "@/assets/buttons/button";

import editUserIcon from "@/assets/Images/icon/edit-user-icon.svg";
import crossIcon from "@/assets/Images/icon/cross-icon.svg";

/* avatar icon */
import profileAvatar from "@/assets/Images/icon/Profile-avatar.svg";

function getUserField(user, keys, fallback = "") {
  for (const key of keys) {
    const value = user?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

export default function EditUserPanel({ user, onClose, onCancel }) {
  const firstName = getUserField(user, ["first_name", "firstName"]);
  const lastName = getUserField(user, ["last_name", "lastName"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const displayName =
    fullName || getUserField(user, ["name", "full_name", "fullName", "username", "user_name"], "");
  const email = getUserField(user, ["email"], "");
  const phone = getUserField(user, ["phone", "phone_no", "mobile", "mobile_no"], "");

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
            <input className="input-field" placeholder="Full Name" defaultValue={displayName} />
            <input className="input-field" placeholder="E-mail Address" defaultValue={email} />
            <input className="input-field" placeholder="Phone Number" defaultValue={phone} />
          </div>

          <div className="panel-buttons">
            <PdpButton className="panel-button" variant="outline" onClick={onCancel}>
              Cancel
            </PdpButton>

            <PdpButton className="panel-button" variant="primary">
              Update
            </PdpButton>
          </div>
        </div>
      </div>
    </div>
  );
}