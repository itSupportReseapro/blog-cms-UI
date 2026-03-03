"use client";

import Image from "next/image";
import letterIcon from "@/assets/Images/icon/Letter.svg";
import phoneIcon from "@/assets/Images/icon/Phone Calling.svg";
import keyIcon from "@/assets/Images/icon/Key Minimalistic Square 4.svg";
import logoutIcon from "@/assets/Images/icon/Arrows ALogout 3.svg";
import editIcon from "@/assets/Images/icon/edit-icon.svg";

export default function UserDetailsPanel({ onClose, onEdit, onLogout }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="user-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>User Details</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-circle"></div>
            <button className="edit-avatar-btn" onClick={onEdit}>
              <Image src={editIcon} alt="Edit" />
            </button>
          </div>

          <h4 className="user-name">Epari Sadashiv Reddy</h4>

          <div className="info-row">
            <Image src={letterIcon} alt="Mail" />
            <span>eparisadashiv.reddy@reseapro.com</span>
          </div>

          <div className="info-row">
            <Image src={phoneIcon} alt="Phone" />
            <span>+91 - 9861513301</span>
          </div>

          <div className="panel-buttons">
            <button className="btn-outline">
              <Image src={keyIcon} alt="" />
              Reset Password
            </button>

            <button className="btn-primary" onClick={onLogout}>
              <Image src={logoutIcon} alt="" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}