"use client";

import { useState, useEffect, useRef } from "react";
import "./EditUserPanel.css";
import Image from "next/image";
import PdpButton from "@/assets/buttons/button";
import { updateProfile } from "@/services/auth.service";
import { resolveUploadUrl, uploadCmsAsset } from "@/services/cms.service";
import { useAuth } from "@/hooks/useAuth";

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

export default function EditUserPanel({ user, targetUserId, onClose, onCancel, onUpdateSuccess }) {
  const firstName = getUserField(user, ["first_name", "firstName"]);
  const lastName = getUserField(user, ["last_name", "lastName"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const displayName =
    fullName || getUserField(user, ["name", "full_name", "fullName", "username", "user_name"], "");
  const email = getUserField(user, ["email_address_personal", "email"], "");
  const officialEmail = getUserField(user, ["email_address_official", "official_email"], "");
  const phone = getUserField(
    user,
    ["mobile_number_primary", "phone", "phone_no", "mobile", "mobile_no"],
    ""
  );
  const secondaryPhone = getUserField(
    user,
    ["mobile_number_secondary", "whatsapp_no", "secondary_phone"],
    ""
  );

  const { updateUserContext } = useAuth();
  
  const [formData, setFormData] = useState({
    name: displayName || "",
    email: email || "",
    official_email: officialEmail || "",
    phone: phone || "",
    secondary_phone: secondaryPhone || "",
    address_1: user?.address_1 || "",
    address_2: user?.address_2 || "",
    pan: user?.pan || "",
    aadhar_no: user?.aadhar_no || "",
    is_active: user?.is_active ?? user?.status?.is_active ?? 1,
  });
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    resolveUploadUrl(getUserField(user, ["user_photo", "profilePicture", "avatar", "image"], ""))
  );
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      window.addSnackbar?.("Uploading photo...", "info");
      const { url } = await uploadCmsAsset(file);
      setAvatarUrl(resolveUploadUrl(url));
      window.addSnackbar?.("Photo uploaded successfully", "success");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      window.addSnackbar?.("Photo upload failed", "error");
    }
  };

  useEffect(() => {
    setFormData({
      name: displayName || "",
      email: email || "",
      official_email: officialEmail || "",
      phone: phone || "",
      secondary_phone: secondaryPhone || "",
      address_1: user?.address_1 || "",
      address_2: user?.address_2 || "",
      pan: user?.pan || "",
      aadhar_no: user?.aadhar_no || "",
      is_active: user?.is_active ?? user?.status?.is_active ?? 1,
    });
  }, [user, displayName, email, officialEmail, phone, secondaryPhone]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const nameParts = (formData.name || "").trim().split(" ");
      const newFirstName = nameParts[0] || "";
      const newLastName = nameParts.slice(1).join(" ") || "";

      // If we have a targetUserId, call updateUser (Admin action on another user)
      if (targetUserId) {
        // Import must be dynamic or handled in the file (added next)
        const { updateUser } = await import("@/services/user.service");
        const payload = {
          first_name: newFirstName,
          last_name: newLastName,
          phone_no: formData.phone,
          address_1: formData.address_1,
          address_2: formData.address_2,
          pan: formData.pan,
          aadhar_no: formData.aadhar_no,
          is_active: formData.is_active,
        };
        const res = await updateUser(targetUserId, payload);
        if (res && !res.error) {
          window.addSnackbar?.("User updated successfully", "success");
          if (onUpdateSuccess) onUpdateSuccess(payload);
          onClose();
        } else {
          window.addSnackbar?.(res?.message || "Failed to update user", "error");
        }
        return;
      }

      // Self-update (My Profile) fallback
      const valOrEmptyString = (val) => {
        const str = String(val || "").trim();
        return str ? str : "";
      };

      const payload = {
        id: user?.id,
        user_id: user?.user_id,
        full_name: valOrEmptyString(formData.name),
        first_name: valOrEmptyString(newFirstName),
        middle_name: user?.middle_name ?? null,
        last_name: valOrEmptyString(newLastName),
        date_of_birth: valOrEmptyString(user?.date_of_birth || user?.dob),
        gender: valOrEmptyString(user?.gender),
        company_name: valOrEmptyString(user?.company_name || user?.company),
        gst_number: valOrEmptyString(user?.gst_number || user?.gst),
        mobile_number_primary: valOrEmptyString(formData.phone),
        mobile_number_secondary: valOrEmptyString(formData.secondary_phone),
        email_address_personal: valOrEmptyString(formData.email),
        email_address_official: valOrEmptyString(formData.official_email),
        user_photo: valOrEmptyString(resolveUploadUrl(avatarUrl)),
        modify_by: "self",
      };

      const res = await updateProfile(payload);
      if (res && !res.error) {
        const updatedProfile = {
          ...(res?.data || {}),
          ...payload,
        };

        if (updateUserContext) {
          updateUserContext({
            ...user,
            ...updatedProfile,
            email: updatedProfile.email_address_personal,
            name: updatedProfile.full_name,
          });
        }
        onUpdateSuccess?.(updatedProfile);
        window.addSnackbar?.("Profile updated successfully", "success");
        onClose();
      } else {
        window.addSnackbar?.(res?.message || "Failed to update profile", "error");
      }
    } catch (error) {
      window.addSnackbar?.(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

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

            {/* small edit icon */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
            <button className="edit-avatar-btn" onClick={() => fileInputRef.current?.click()}>
              <Image src={editUserIcon} alt="Edit" width={34} height={34} />
            </button>

          </div>

          <div className="form-section">
            <input 
              className="input-field" 
              placeholder="Full Name" 
              name="name"
              value={formData.name || ""} 
              onChange={handleChange}
            />
            <input 
              className="input-field" 
              placeholder="E-mail Address" 
              name="email"
              value={formData.email || ""} 
              onChange={handleChange}
              disabled={!!targetUserId} // Email usually not editable unless it's self profile, but we'll just restrict it for safety
            />
            {!targetUserId && (
              <input
                className="input-field"
                placeholder="Official E-mail Address"
                name="official_email"
                value={formData.official_email || ""}
                onChange={handleChange}
              />
            )}
            <input 
              className="input-field" 
              placeholder="Phone Number" 
              name="phone"
              value={formData.phone || ""} 
              onChange={handleChange}
            />
            {!targetUserId && (
              <input
                className="input-field"
                placeholder="Secondary Phone Number"
                name="secondary_phone"
                value={formData.secondary_phone || ""}
                onChange={handleChange}
              />
            )}
            <input 
              className="input-field" 
              placeholder="Address Line 1" 
              name="address_1"
              value={formData.address_1 || ""} 
              onChange={handleChange}
            />
            <input 
              className="input-field" 
              placeholder="Address Line 2" 
              name="address_2"
              value={formData.address_2 || ""} 
              onChange={handleChange}
            />
            <input 
              className="input-field" 
              placeholder="PAN Number" 
              name="pan"
              value={formData.pan || ""} 
              onChange={handleChange}
            />
            <input 
              className="input-field" 
              placeholder="Aadhar Number" 
              name="aadhar_no"
              value={formData.aadhar_no || ""} 
              onChange={handleChange}
            />
            {targetUserId && (
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", marginTop: "10px" }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={handleChange}
                />
                Active User
              </label>
            )}
          </div>

          <div className="panel-buttons">
            <PdpButton className="panel-button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </PdpButton>

            <PdpButton className="panel-button" variant="primary" onClick={handleUpdate} isLoading={loading}>
              Update
            </PdpButton>
          </div>
        </div>
      </div>
    </div>
  );
}
