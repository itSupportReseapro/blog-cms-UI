"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { hasSelectedBlogApp } from "@/lib/blogAppContext";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (!hasSelectedBlogApp()) {
      router.replace("/choose-cms");
    }
  }, [router]);

  // Map pathname to active section
  useEffect(() => {
    if (pathname.includes("/blog/dashboard")) {
      setActiveSection("dashboard");
    } else if (pathname.includes("/blog/blogs")) {
      setActiveSection("blogs");
    } else if (pathname.includes("/blog/activity-log")) {
      setActiveSection("activity-log");
    } else if (pathname.includes("/blog/about-us")) {
      setActiveSection("about-us");
    } else if (pathname.includes("/blog/contact-us")) {
      setActiveSection("contact-us");
    } else if (pathname.includes("/blog/user-and-role")) {
      setActiveSection("user-and-role");
    } else if (pathname.includes("/blog/privacy-policy")) {
      setActiveSection("privacy-policy");
    } else if (pathname.includes("/blog/term-and-condition")) {
      setActiveSection("term-and-condition");
    }
  }, [pathname]);

  return (
    <div className="dashboard-layout">
      <Sidebar activeSection={activeSection} />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
