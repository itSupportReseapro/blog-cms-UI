"use client";

import "./page.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import Table from "@/assets/ui/tables/Table";

import BothArrowIcon from "@/assets/Images/icon/both-arrow.svg";
import SearchIcon from "@/assets/Images/icon/search-icon.svg";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";
import DownloadIcon from "@/assets/Images/icon/DownloadIcon.svg";
import PlusIcon from "@/assets/Images/icon/plus-icon.svg";

/* ================= DATA ================= */

const postTitles = [
  "Getting Started with Next.js 14", "Advanced React Patterns", "CSS Tricks for Modern Layouts",
  "Understanding Hooks in React", "Database Optimization Guide", "Web Performance Tips",
  "TypeScript Best Practices", "GraphQL vs REST APIs", "State Management Solutions",
  "Testing Strategies in React", "Building Scalable Applications", "Security in Web Apps",
  "API Design Patterns", "Database Normalization", "Caching Strategies",
  "Accessibility Guidelines", "SEO Optimization Tips", "Mobile-First Design",
  "Performance Monitoring", "Error Handling Techniques", "Authentication Methods",
  "Authorization Patterns", "Deployment Best Practices", "CI/CD Pipelines",
  "Docker Containerization", "Kubernetes Basics", "Microservices Architecture",
  "Serverless Computing", "Edge Computing", "Machine Learning Integration",
  "Real-time Applications", "WebSocket Communication", "Progressive Web Apps",
  "Service Workers Guide", "Browser APIs", "File Handling in Web Apps"
];

const authors = [
  "John Doe", "Jane Smith", "Alice Brown",
  "Bob Wilson", "Carol Davis", "David Lee",
  "Emma Wilson", "Frank Johnson"
];

const statuses = [
  "published",
  "draft",
  "created",
  "unpublished",
  "deleted"
];

const blogPostsData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title:
    postTitles[i % postTitles.length] +
    (i >= postTitles.length ? ` (${Math.floor(i / postTitles.length)})` : ""),
  author: authors[Math.floor(Math.random() * authors.length)],
  lastUpdated: new Date(
    Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
  ).toISOString().split("T")[0],
  status: statuses[Math.floor(Math.random() * statuses.length)],
}));

/* ================= COMPONENT ================= */

export default function BlogDashboardPage() {
  const [activeTab, setActiveTab] = useState("all");

  const handleTableAction = (actionKey, row) => {
    console.log(`Action: ${actionKey}`, row);
  };

  const filteredData = useMemo(() => {
    if (activeTab === "all") return blogPostsData;
    return blogPostsData.filter((item) => item.status === activeTab);
  }, [activeTab]);

  const blogPostsColumns = [
    { key: "id", label: "Sl. No.", width: "60px" },

    {
      key: "title",
      label: (
        <div className="sortable-head">
          Blog Title
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "310px"
    },

    {
      key: "author",
      label: (
        <div className="sortable-head">
          Author
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "150px"
    },

    {
      key: "lastUpdated",
      label: (
        <div className="sortable-head">
          Last Updated
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "150px"
    },

    {
      key: "status",
      label: (
        <div className="sortable-head">
          Status
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "120px",
      render: (row) => (
        <span className={`status-pill ${row.status}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <section className="cms-dashboard">
      <div className="main-card">

        {/* ================= TOP CONTROLS ================= */}

        <div className="top-controls">

          {/* ✅ FIXED CREATE BLOG BUTTON */}
          <Link href="./create-blog" className="create-btn">
            <Image src={PlusIcon} alt="Add" width={18} height={18} />
            Create Blog
          </Link>

          <div className="right-controls">
            <div className="search-wrapper">
              <Image src={SearchIcon} alt="Search" width={16} height={16} />
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
            </div>

            <button className="icon-btn">
              <Image src={DownloadIcon} alt="Download" width={18} height={18} />
            </button>

            <button className="icon-btn">
              <Image src={FilterIcon} alt="Filter" width={18} height={18} />
            </button>
          </div>
        </div>

        {/* ================= TABS ================= */}

        <div className="tabs-wrapper">
          {[
            { key: "all", label: "All Blogs" },
            { key: "draft", label: "Draft" },
            { key: "created", label: "Created" },
            { key: "published", label: "Published" },
            { key: "unpublished", label: "Unpublished" },
            { key: "deleted", label: "Deleted" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TABLE ================= */}

        <div className="table-wrapper">
          <Table
            data={filteredData}
            columns={blogPostsColumns}
            onActionExecute={handleTableAction}
          />
        </div>

      </div>
    </section>
  );
}