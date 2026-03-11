"use client";

import "./page.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

import Table from "@/assets/ui/tables/Table";
import PdpButton from "@/assets/buttons/button";

import DeleteBlogModal from "@/assets/ui/modals/DeleteBlogModal";

import SearchIcon from "@/assets/Images/icon/search-icon.svg";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";
import DownloadIcon from "@/assets/Images/icon/DownloadIcon.svg";
import PlusIcon from "@/assets/Images/icon/plus-icon.svg";

/* ================= ACTION MENU LOGIC ================= */

const tableActions = [
  {
    key: "publish",
    label: "Publish",
    condition: (row) => row.status === "unpublished"
  },
  {
    key: "unpublish",
    label: "Unpublish",
    condition: (row) => row.status === "published"
  },
  {
    key: "edit",
    label: "Edit",
    condition: (row) =>
      row.status === "published" ||
      row.status === "unpublished" ||
      row.status === "draft"
  },
  {
    key: "details",
    label: "Details",
    condition: () => true
  },
  {
    key: "delete",
    label: "Delete",
    condition: (row) =>
      row.status === "published" ||
      row.status === "unpublished" ||
      row.status === "draft"
  },
  {
    key: "rollback",
    label: "Roll Back",
    condition: (row) => row.status === "deleted"
  }
];

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
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleTableAction = (actionKey, row) => {

    if (actionKey === "delete") {
      setSelectedBlog(row);
      setDeleteModalOpen(true);
      return;
    }

    console.log(`Action: ${actionKey}`, row);
  };

  const filteredData = useMemo(() => {

    let data = blogPostsData;

    if (activeTab !== "all") {
      data = data.filter((item) => item.status === activeTab);
    }

    if (search.trim() !== "") {
      data = data.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;

  }, [activeTab, search]);

  const blogPostsColumns = [

    { key: "id", label: "Sl. No.", sortable: false },

    {
      key: "title",
      label: "Blog Title",
      sortable: true
    },

    {
      key: "author",
      label: "Author",
      sortable: true
    },

    {
      key: "lastUpdated",
      label: "Last Updated",
      sortable: true
    },

    {
      key: "status",
      label: "Status",
      sortable: true,
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

          <Link href="./create-blog">
            <PdpButton
              variant="primary"
              size="md"
              radius="sm"
              icon={PlusIcon}
              iconPosition="left"
            >
              Create Blog
            </PdpButton>
          </Link>

          <div className="right-controls">

            <div className="search-wrapper">

              <Image src={SearchIcon} alt="Search" width={16} height={16} />

              <input
                type="text"
                placeholder="Search blogs..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            actions={tableActions}
            onActionExecute={handleTableAction}
            statusColumnKey="status"
            rowKey="id"
            defaultPageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            breakpoint={768}
            showFooter={true}
          />

        </div>

      </div>

      {/* ================= DELETE MODAL ================= */}

      <DeleteBlogModal
        isOpen={deleteModalOpen}
        blogTitle={selectedBlog?.title}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {

          console.log("Delete confirmed:", selectedBlog);

          setDeleteModalOpen(false);

        }}
      />

    </section>
  );
}