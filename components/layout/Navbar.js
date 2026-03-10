"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Image from "next/image";
import bellIcon from "@/assets/Images/icon/bell-icon.svg";
import profileIcon from "@/assets/Images/icon/profile-avatar.svg";

import UserDetailsPanel from "@/assets/ui/modals/UserDetailsPanel";
import EditUserPanel from "@/assets/ui/modals/EditUserPanel";

import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  useEffect(() => {
    if (showUserDetails || showEditDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showUserDetails, showEditDetails]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

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
          <button className="navbar-bell">
            <Image src={bellIcon} alt="Notifications" width={36} height={40} />
          </button>

          <button
            className="navbar-avatar"
            onClick={() => setShowUserDetails(true)}
          >
            <Image src={profileIcon} alt="Profile" width={52} height={52} />
          </button>
        </div>
      </nav>

      {showUserDetails && (
        <UserDetailsPanel
          onClose={() => setShowUserDetails(false)}
          onEdit={() => {
            setShowUserDetails(false);
            setShowEditDetails(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {showEditDetails && (
        <EditUserPanel
          onClose={() => setShowEditDetails(false)}
          onCancel={() => {
            setShowEditDetails(false);
            setShowUserDetails(true);
          }}
        />
      )}
    </>
  );
}