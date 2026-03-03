"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import bellIcon from "@/assets/Images/icon/bell-icon.svg";
import profileIcon from "@/assets/Images/icon/profile-avatar.svg";
import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.replace("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT TITLE */}
      <div className="navbar-left">
        <h2 className="navbar-title">
          Content <br />
          Management System
        </h2>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {/* Bell */}
        <button className="navbar-bell" aria-label="Notifications">
          <Image
            src={bellIcon}
            alt="Notifications"
            className="navbar-bell-icon"
          />
        </button>

        {/* Avatar */}
        <div className="navbar-user-menu" ref={userMenuRef}>
          <button
            className="navbar-avatar"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User menu"
          >
            <Image
              src={profileIcon}
              alt="Profile"
              className="navbar-avatar-icon"
            />
          </button>

          {userMenuOpen && (
            <div className="navbar-user-dropdown">
              <button
                className="navbar-dropdown-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/blog/user-and-role");
                }}
              >
                Profile
              </button>
              <button
                className="navbar-dropdown-item navbar-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}