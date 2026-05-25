"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Image from "next/image";
import bellIcon from "@/assets/Images/icon/bell-icon.svg";
import profileIcon from "@/assets/Images/icon/Profile-avatar.svg";
import { viewProfile, logoutUser } from "@/services/auth.service";
import { resolveUploadUrl } from "@/services/cms.service";
import { clearBlogAppSelection } from "@/lib/blogAppContext";

import UserDetailsPanel from "@/assets/modals/UserDetailsPanel/UserDetailsPanel";
import EditUserPanel from "@/assets/modals/EditUserPanel/EditUserPanel";
import ChangePasswordModal from "@/assets/modals/ChangePasswordModal/ChangePasswordModal";

import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const { user, logout, updateUserContext } = useAuth();

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (showUserDetails || showEditDetails || showChangePassword) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showUserDetails, showEditDetails, showChangePassword]);

  // Fetch profile on mount so the navbar avatar is live
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await viewProfile(user?.id);
      if (res && !res.error) {
        const data = res.data || res;
        setProfileData(data);
        if (updateUserContext) {
          updateUserContext({ ...user, ...data });
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleAvatarClick = async () => {
    await fetchProfile();
    setShowUserDetails(true);
  };

  const handleProfileUpdated = (updatedProfile) => {
    setProfileData((currentProfile) => ({
      ...(currentProfile || {}),
      ...(updatedProfile || {}),
    }));
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await logoutUser();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local session regardless of API response
      clearBlogAppSelection();
      logout();
      router.replace("/login");
    }
  };

  const mergedUser = profileData ? { ...user, ...profileData } : user;
  const navbarAvatarUrl = resolveUploadUrl(
    user?.user_photo ||
      profileData?.user_photo ||
      mergedUser?.profilePicture ||
      mergedUser?.avatar ||
      mergedUser?.image ||
      ""
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">
            Content <br />
            Management System
          </h2>
        </div>

        <div className="navbar-right">
          <button
            className="navbar-switchCms"
            type="button"
            onClick={() => router.push("/choose-cms")}
          >
            Switch CMS
          </button>

          {/* <button className="navbar-bell">
            <Image src={bellIcon} alt="Notifications" width={28} height={28} />
          </button> */}

          <button
            className="navbar-avatar"
            onClick={handleAvatarClick}
          >
            {navbarAvatarUrl ? (
              <img
                src={navbarAvatarUrl}
                alt="Profile"
                className="navbar-avatar-img"
              />
            ) : (
              <Image src={profileIcon} alt="Profile" width={44} height={44} />
            )}
          </button>
        </div>
      </nav>

      {showUserDetails && (
        <UserDetailsPanel
          user={mergedUser}
          onClose={() => setShowUserDetails(false)}
          onEdit={() => {
            setShowUserDetails(false);
            setShowEditDetails(true);
          }}
          onResetPassword={() => {
            setShowUserDetails(false);
            setShowChangePassword(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {showEditDetails && (
        <EditUserPanel
          user={mergedUser}
          onClose={() => setShowEditDetails(false)}
          onCancel={() => {
            setShowEditDetails(false);
            setShowUserDetails(true);
          }}
          onUpdateSuccess={handleProfileUpdated}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => {
            setShowChangePassword(false);
          }}
        />
      )}
    </>
  );
}
