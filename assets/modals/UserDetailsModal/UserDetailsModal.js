"use client";

import "./UserDetailsModal.css";
import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";
import { resolveUploadUrl } from "@/services/cms.service";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getInitials(name) {
  const safeName = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return safeName || "U";
}

function normalizeRole(role) {
  const rawRole = String(role || "user").toLowerCase();
  return ["admin", "editor", "user"].includes(rawRole) ? rawRole : "user";
}

export default function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  const profileUrl = resolveUploadUrl(
    user.user_photo ||
    user.profilePicture ||
    user.profile ||
    user.avatar ||
    user.image ||
    ""
  );
  const fileName = profileUrl ? profileUrl.split("/").pop() : "-";
  const roleTone = normalizeRole(user.role);
  const userFields = [
    { label: "Email", value: formatValue(user.email) },
    { label: "Phone Number", value: formatValue(user.phone) },
    { label: "Gender", value: formatValue(user.gender) },
    { label: "Date of Birth", value: formatValue(user.dob) },
    { label: "Default Password", value: formatValue(user.password) },
    { label: "Profile Picture", value: fileName, href: profileUrl || null },
  ];

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div
        className="user-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
        <div className="user-modal-header">
          <h3>User Details</h3>
          <button
            className="user-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Image src={CrossIcon} alt="close" width={18} height={18} />
          </button>
        </div>

        <div className="user-details-grid">
          <section className="user-summary user-grid-full">
            <div className="user-summary-avatar">
              {profileUrl ? (
                <img src={profileUrl} alt={formatValue(user.name)} className="user-avatar-image" />
              ) : (
                <span className="user-avatar-fallback">{getInitials(user.name)}</span>
              )}
            </div>

            <div className="user-summary-copy">
              <span className="user-section-kicker">User Name</span>
              <h4>{formatValue(user.name)}</h4>
              <div className="user-summary-meta">
                <span className={`user-role-pill user-role-pill-${roleTone}`}>{formatValue(user.role)}</span>
                <span className="user-id-pill">ID {formatValue(user.id)}</span>
              </div>
            </div>
          </section>

          <section className="user-detail-section user-grid-full">
            <div className="user-section-header">
              <span>Profile Details</span>
            </div>
            <div className="user-section-grid">
              {userFields.map((field) => (
                <div className="user-detail-card" key={field.label}>
                  <span className="user-detail-label">{field.label}</span>
                  {field.href ? (
                    <a
                      href={field.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="user-value-link"
                    >
                      {field.value}
                    </a>
                  ) : (
                    <p className="user-detail-value">{field.value}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
