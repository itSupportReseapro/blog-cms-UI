"use client";

import "./AddUserForm.css";
import Image from "next/image";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";

import BackArrowIcon from "@/assets/Images/img/back-arrow.svg";
import EditUserIcon from "@/assets/Images/icon/edit-user-icon.svg";
import DefaultAvatar from "@/assets/Images/icon/Profile-avatar.svg";
import KeyIcon from "@/assets/Images/icon/Key Minimalistic Square 4.svg";
import { resolveUploadUrl } from "@/services/cms.service";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const FALLBACK_ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "User", value: "user" },
];

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export default function AddUserForm({
  formData,
  onChange,
  onAvatarUpload,
  onSubmit,
  onBack,
  mode = "add",
  loading = false,
  roleOptions = [],
}) {
  const isEdit = mode === "edit";

  // Build dropdown options from API roles, falling back to static list
  const roleDropdownOptions =
    Array.isArray(roleOptions) && roleOptions.length > 0
      ? roleOptions.map((r) => ({
          label: r.role_name || r.name || r.label || r.role_key || String(r),
          value: r.role_name || r.name || r.role_key || String(r),
        }))
      : FALLBACK_ROLE_OPTIONS;

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    onChange({ target: { name: "password", value: pwd } });
  };

  return (

    <section className="add-user-page">

      <div className="add-user-container">

        {/* HEADER */}

        <div className="add-user-header">

          <div className="header-left" onClick={onBack}>
            <Image src={BackArrowIcon} alt="back" width={10} height={10} />
            <span>{isEdit ? "Edit User" : "Add User"}</span>
          </div>

          <PdpButton
            variant="primary"
            size="md"
            onClick={onSubmit}
            disabled={loading}
          >
            {isEdit ? "Save" : "Add"}
          </PdpButton>

        </div>

        {/* PROFILE */}

        <div className="profile-section">

          <div className="profile-avatar-wrapper">

            <div className="avatar-border">

              <div className="avatar-circle">

                {formData.avatar ? (
                  <img
                    src={resolveUploadUrl(formData.avatar)}
                    alt="avatar"
                    className="profile-avatar"
                  />
                ) : (
                  <Image
                    src={DefaultAvatar}
                    alt="avatar"
                    width={160}
                    height={160}
                    className="profile-avatar"
                  />
                )}

                <label className="avatar-edit">
                  <Image src={EditUserIcon} alt="edit" width={24} height={24} />
                  <input type="file" accept="image/*" onChange={onAvatarUpload} />
                </label>

              </div>

            </div>

          </div>

        </div>

        {/* FORM */}

        <div className="form-grid">

          <PdpTextbox1
            label="Name"
            id="add-user-name"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="E-mail"
            id="add-user-email"
            name="email"
            value={formData.email || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Phone Number"
            id="add-user-phone"
            name="phone"
            value={formData.phone || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Gender"
            id="add-user-gender"
            name="gender"
            value={formData.gender || ""}
            onChange={onChange}
            dropdownOptions={GENDER_OPTIONS}
          />

          <PdpTextbox1
            label="Date of Birth"
            id="add-user-dob"
            name="dob"
            type="date"
            value={formData.dob || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Role"
            id="add-user-role"
            name="role"
            value={formData.role || ""}
            onChange={onChange}
            dropdownOptions={roleDropdownOptions}
          />

          <div className="password-row">

            <PdpTextbox1
              label="Password"
              id="add-user-password"
              name="password"
              value={formData.password || ""}
              onChange={onChange}
              maskText
            />

            <button
              type="button"
              className="generate-pwd-btn"
              onClick={handleGeneratePassword}
              title="Generate password"
            >
              <Image src={KeyIcon} alt="generate" width={22} height={22} />
            </button>

          </div>

        </div>

      </div>

    </section>

  );

}
