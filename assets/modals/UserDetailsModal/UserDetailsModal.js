"use client";

import "./UserDetailsModal.css";
import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";

export default function UserDetailsModal({ user, onClose }) {

  if (!user) return null;

  /* detect profile image field safely */
  const profileUrl =
    user.profilePicture ||
    user.profile ||
    user.avatar ||
    user.image ||
    "";

  /* extract filename */
  const fileName = profileUrl ? profileUrl.split("/").pop() : "-";

  return (
    <div className="user-modal-overlay" onClick={onClose}>

      <div className="user-modal" onClick={(e) => e.stopPropagation()}>

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
              width={18}
              height={18}
            />
          </button>

        </div>

        {/* BODY */}

        <div className="user-details-grid">

          <div className="detail-row">
            <span>Name</span>
            <a className="value-link">{user.name || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Email</span>
            <a className="value-link">{user.email || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Phone Number</span>
            <a className="value-link">{user.phone || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Gender</span>
            <a className="value-link">{user.gender || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Date of Birth</span>
            <a className="value-link">{user.dob || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Role</span>
            <a className="value-link">{user.role || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Default Password</span>
            <a className="value-link">{user.password || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Profile Picture</span>

            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="value-link"
              >
                {fileName}
              </a>
            ) : (
              <p>-</p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}