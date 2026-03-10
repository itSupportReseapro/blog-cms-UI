"use client";

import "./user-panel.css";
import Image from "next/image";

import letterIcon from "@/assets/Images/icon/Letter.svg";
import phoneIcon from "@/assets/Images/icon/Phone Calling.svg";
import keyIcon from "@/assets/Images/icon/Key Minimalistic Square 4.svg";
import logoutIcon from "@/assets/Images/icon/Arrows ALogout 3.svg";

import editIcon from "@/assets/Images/icon/edit-icon.svg";
import crossIcon from "@/assets/Images/icon/cross-icon.svg";

/* NEW avatar icon */
import profileAvatar from "@/assets/Images/icon/profile-avatar.svg";

export default function UserDetailsPanel({ onClose, onEdit, onLogout }) {
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
              <Image
                src={profileAvatar}
                alt="Avatar"
                width={70}
                height={70}
              />
            </div>

            {/* SMALL edit icon */}
            <button className="edit-avatar-btn" onClick={onEdit}>
              <Image src={editIcon} alt="Edit" width={34} height={34} />
            </button>

          </div>

          <h4 className="user-name">Epari Sadashiv Reddy</h4>

          <div className="info-row">
            <Image src={letterIcon} alt="Mail" width={18} height={18} />
            <span>eparisadashiv.reddy@reseapro.com</span>
          </div>

          <div className="info-row">
            <Image src={phoneIcon} alt="Phone" width={18} height={18} />
            <span>+91 - 9861513301</span>
          </div>

          <div className="panel-buttons">

            <button className="btn-outline">
              <Image src={keyIcon} alt="" width={16} height={16} />
              Reset Password
            </button>

            <button className="btn-primary" onClick={onLogout}>
              <Image src={logoutIcon} alt="" width={16} height={16} />
              Logout
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}