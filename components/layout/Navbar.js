"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
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
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <div className="navbar-title-wrapper">
            <div className="navbar-title">
              <h3>Blog CMS</h3>
              <p>Content Management System</p>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          <button className="navbar-icon-btn" aria-label="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.74 21H4.26"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="navbar-user-menu" ref={userMenuRef}>
            <button
              className="navbar-user-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="User menu"
            >
              <div className="navbar-user-avatar">
                {/* Fallback: user initial or icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
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
                <button className="navbar-dropdown-item navbar-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
