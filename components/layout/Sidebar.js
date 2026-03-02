"use client";

import Link from "next/link";
import "./Sidebar.css";

const menuItems = [
  { href: "/blog/dashboard", label: "Dashboard", id: "dashboard" },
  { href: "/blog/blogs", label: "Blogs", id: "blogs" },
  { href: "/blog/activity-log", label: "Activity Log", id: "activity-log" },
  { href: "/blog/user-and-role", label: "User & Role", id: "user-and-role" },
  { href: "/blog/privacy-policy", label: "Privacy Policy", id: "privacy-policy" },
  { href: "/blog/term-and-condition", label: "Terms & Conditions", id: "term-and-condition" },
];

export default function Sidebar({ activeSection }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sidebar-link ${activeSection === item.id ? "active" : ""}`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
