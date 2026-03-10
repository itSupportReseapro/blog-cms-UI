"use client";

import "./UserDetailsModal.css";
import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";

export default function UserDetailsModal({ user, onClose }) {

  if (!user) return null;

  return (
    <div className="user-modal-overlay">

      <div className="user-modal">

        {/* HEADER */}

        <div className="user-modal-header">

          <h3>User Details</h3>

          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Image
              src={CrossIcon}
              alt="close"
              width={16}
              height={16}
            />
          </button>

        </div>

        {/* BODY */}

        <div className="user-details-grid">

          <div className="detail-item">
            <span>Name</span>
            <p className="value-link">{user.name}</p>
          </div>

          <div className="detail-item">
            <span>Email</span>
            <p className="value-link">{user.email}</p>
          </div>

          <div className="detail-item">
            <span>Phone Number</span>
            <p className="value-link">{user.phone}</p>
          </div>

          <div className="detail-item">
            <span>Gender</span>
            <p className="value-link">{user.gender}</p>
          </div>

          <div className="detail-item">
            <span>Date of Birth</span>
            <p className="value-link">{user.dob}</p>
          </div>

          <div className="detail-item">
            <span>Role</span>
            <p className="value-link">{user.role}</p>
          </div>

          <div className="detail-item">
            <span>Default Password</span>
            <p className="value-link">{user.password}</p>
          </div>

          <div className="detail-item">
            <span>Profile Picture</span>
            <p className="value-link">profilepicture.jpg</p>
          </div>

        </div>

      </div>

    </div>
  );
}