"use client";

import "./AddUserForm.css";
import Image from "next/image";
import PdpTextbox1 from "@/assets/textbox/PdpTextbox1";
import PdpButton from "@/assets/buttons/button";

import BackArrowIcon from "@/assets/Images/img/back-arrow.svg";
import EditUserIcon from "@/assets/Images/icon/edit-user-icon.svg";
import DefaultAvatar from "@/assets/Images/icon/profile-avatar.svg";

export default function AddUserForm({
  formData,
  onChange,
  onAvatarUpload,
  onSubmit,
  onBack
}) {

  return (

    <section className="add-user-page">

      <div className="add-user-container">

        {/* HEADER */}

        <div className="add-user-header">

          <div className="header-left" onClick={onBack}>
            <Image src={BackArrowIcon} alt="back" width={10} height={10}/>
            <span>Add User</span>
          </div>

          <PdpButton
            variant="primary"
            size="md"
            onClick={onSubmit}
          >
            Add
          </PdpButton>

        </div>

        {/* PROFILE */}

        <div className="profile-section">

          <div className="profile-avatar-wrapper">

            {/* OUTER BORDER */}
            <div className="avatar-border">

              {/* INNER AVATAR */}
              <div className="avatar-circle">

                <Image
                  src={formData.avatar || DefaultAvatar}
                  alt="avatar"
                  width={160}
                  height={160}
                  className="profile-avatar"
                />

                {/* EDIT ICON */}
                <label className="avatar-edit">

                  <Image
                    src={EditUserIcon}
                    alt="edit"
                    width={24}
                    height={24}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarUpload}
                  />

                </label>

              </div>

            </div>

          </div>

        </div>

        {/* FORM */}

        <div className="form-grid">

          <PdpTextbox1
            label="Name"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="E-mail"
            name="email"
            value={formData.email || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Phone Number"
            name="phone"
            value={formData.phone || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={onChange}
            dropdownOptions={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" }
            ]}
          />

          <PdpTextbox1
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob || ""}
            onChange={onChange}
          />

          <PdpTextbox1
            label="Role"
            name="role"
            value={formData.role || ""}
            onChange={onChange}
            dropdownOptions={[
              { label: "Admin", value: "Admin" },
              { label: "Editor", value: "Editor" }
            ]}
          />

          <PdpTextbox1
            label="Default Password"
            name="password"
            value={formData.password || ""}
            onChange={onChange}
            maskText
          />

        </div>

      </div>

    </section>

  );

}