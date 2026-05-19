"use client";

import { useState } from "react";
import Image from "next/image";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";
import { changePassword } from "@/services/auth.service";
import crossIcon from "@/assets/Images/icon/cross-icon.svg";
import "./ChangePasswordModal.css";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.currentPassword) {
      window.addSnackbar?.("Current password is required", "error");
      return;
    }

    if (!form.newPassword || form.newPassword.length < 6) {
      window.addSnackbar?.("Password must be at least 6 characters", "error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      window.addSnackbar?.("Passwords do not match", "error");
      return;
    }

    try {
      setSubmitting(true);
      const result = await changePassword(form.currentPassword, form.newPassword);

      if (result?.error) {
        window.addSnackbar?.(result.message || "Failed to change password", "error");
        return;
      }

      window.addSnackbar?.(result?.message || "Password updated successfully", "success");
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-password-overlay" onClick={onClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-header">
          <h3>Change Password</h3>
          <button className="change-password-close" onClick={onClose} aria-label="Close">
            <Image src={crossIcon} alt="Close" width={14} height={14} />
          </button>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <PdpTextbox1
            label="Current Password"
            name="currentPassword"
            id="currentPassword"
            type="password"
            maskText={true}
            value={form.currentPassword}
            onChange={handleChange}
          />

          <PdpTextbox1
            label="New Password"
            name="newPassword"
            id="newPassword"
            type="password"
            maskText={true}
            value={form.newPassword}
            onChange={handleChange}
          />

          <PdpTextbox1
            label="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            maskText={true}
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <div className="change-password-actions">
            <PdpButton
              type="button"
              className="panel-button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </PdpButton>

            <PdpButton type="submit" className="panel-button" variant="primary" isLoading={submitting}>
              Change Password
            </PdpButton>
          </div>
        </form>
      </div>
    </div>
  );
}
