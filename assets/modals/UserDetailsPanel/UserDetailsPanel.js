"use client";

import "./UserDetailsPanel.css";
import Image from "next/image";
import PdpButton from "@/assets/buttons/button";
import { resolveUploadUrl } from "@/services/cms.service";

import letterIcon from "@/assets/Images/icon/Letter.svg";
import phoneIcon from "@/assets/Images/icon/Phone Calling.svg";
import keyIcon from "@/assets/Images/icon/Key Minimalistic Square 4.svg";
import logoutIcon from "@/assets/Images/icon/Arrows ALogout 3.svg";

import editIcon from "@/assets/Images/icon/edit-icon.svg";
import crossIcon from "@/assets/Images/icon/cross-icon.svg";

/* NEW avatar icon */
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

export default function UserDetailsPanel({ user, onClose, onEdit, onLogout, onResetPassword }) {
  const firstName = getUserField(user, ["first_name", "firstName"]);
  const lastName = getUserField(user, ["last_name", "lastName"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const name =
    fullName ||
    getUserField(user, ["name", "full_name", "fullName", "username", "user_name"], "User");
  const email = getUserField(user, ["email"], "Not available");
  const phone = getUserField(user, ["phone", "phone_no", "mobile", "mobile_no"], "Not available");
  const avatarUrl = resolveUploadUrl(user?.user_photo || user?.profilePicture || user?.avatar || user?.image || "");

  return (
    <div className="overlay" onClick={onClose}>
      <div className="user-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>User Details</h3>

          <button className="close-btn" onClick={onClose}>
            <Image src={crossIcon} alt="Close" width={14} height={14} />
          </button>
        </div>

        <div className="avatar-section">
          <div className="avatar-wrapper">

            {/* BIG avatar */}
            <div className="avatar-circle">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="avatar-uploaded-img"
                />
              ) : (
                <Image
                  src={profileAvatar}
                  alt="Avatar"
                  width={70}
                  height={70}
                />
              )}
            </div>

            {/* SMALL edit icon */}
            <button className="edit-avatar-btn" onClick={onEdit}>
              <Image src={editIcon} alt="Edit" width={34} height={34} />
            </button>

          </div>

          <h4 className="user-name">{name}</h4>

          <div className="info-row">
            <Image src={letterIcon} alt="Mail" width={18} height={18} />
            <span>{email}</span>
          </div>

          <div className="info-row">
            <Image src={phoneIcon} alt="Phone" width={18} height={18} />
            <span>{phone}</span>
          </div>

          <div className="panel-buttons">

            <PdpButton
              className="panel-button"
              variant="outline"
              icon={keyIcon}
              iconPosition="left"
              onClick={onResetPassword}
            >
              Reset Password
            </PdpButton>

            <PdpButton
              className="panel-button"
              variant="primary"
              onClick={onLogout}
              icon={logoutIcon}
              iconPosition="left"
            >
              Logout
            </PdpButton>

          </div>
        </div>
      </div>
    </div>
  );
}
