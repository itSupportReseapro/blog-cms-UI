"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./Sidebar.css";

/* --- Import Real SVG Icons --- */
import DashboardIcon from "@/assets/Images/icon/dashboard-icon.svg";
import ActivityIcon from "@/assets/Images/icon/history-icon.svg";
import BlogsIcon from "@/assets/Images/icon/blogs-icon.svg";
import AboutIcon from "@/assets/Images/icon/Info-Circle.svg";
import ContactIcon from "@/assets/Images/icon/Letter-Unread.svg";
import PrivacyIcon from "@/assets/Images/icon/ShieldCheck-icon.svg";
import TermIcon from "@/assets/Images/icon/Shield-User.svg";
import UserRoleIcon from "@/assets/Images/icon/user-role.svg";

const menuItems = [
  { href: "/blog/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/blog/activity-log", label: "Activity Log", icon: ActivityIcon },
  { href: "/blog/blogs", label: "Blogs", icon: BlogsIcon },
  { href: "/blog/about-us", label: "About Us", icon: AboutIcon },
  { href: "/blog/contact-us", label: "Contact Us", icon: ContactIcon },
  { href: "/blog/privacy-policy", label: "Privacy Policy", icon: PrivacyIcon },
  { href: "/blog/term-and-condition", label: "Term & Condition", icon: TermIcon },
  { href: "/blog/user-and-role", label: "User & Role", icon: UserRoleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className="sidebar-icon"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}