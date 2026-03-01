"use client";

import "./page.css";
import Image from "next/image";
import { useState } from "react";
import Table from "@/assets/ui/tables/Table";
import PeopleIcon from "@/assets/Images/icon/peopleICON.svg";
import WebsiteIcon from "@/assets/Images/icon/websiteICON.svg";
import SettingsIcon from "@/assets/Images/icon/settingsICON.svg";
import PlusIcon from "@/assets/Images/icon/plusICON.svg";

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

const authors = ["John Doe", "Jane Smith", "Alice Brown", "Bob Wilson", "Carol Davis", "David Lee", "Emma Wilson", "Frank Johnson"];
const statuses = ["published", "draft", "archived", "pending"];

const blogPostsData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: postTitles[i % postTitles.length] + (i > postTitles.length ? ` (${Math.floor(i / postTitles.length)})` : ""),
  author: authors[Math.floor(Math.random() * authors.length)],
  lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: statuses[Math.floor(Math.random() * statuses.length)],
}));

const blogPostsColumns = [
  { key: 'id', label: 'ID', width: '60px', sortable: false },
  { key: 'title', label: 'Title', width: '250px', sortable: true },
  { key: 'author', label: 'Author', width: '150px', sortable: true },
  { key: 'lastUpdated', label: 'Last Updated', width: '120px', sortable: true },
  { key: 'status', label: 'Status', width: '100px', sortable: true },
];

export default function BlogDashboardPage() {
  const stats = [
    { title: "Total Posts", value: "128", trend: "+12 this week", icon: WebsiteIcon },
    { title: "Published", value: "96", trend: "+8 this week", icon: PeopleIcon },
    { title: "Comments", value: "1,245", trend: "+21 today", icon: SettingsIcon },
    { title: "Categories", value: "14", trend: "2 new", icon: PlusIcon },
  ];

  const handleTableAction = (actionKey, row) => {
    console.log(`Action: ${actionKey}`, row);
    
    switch (actionKey) {
      case "edit":
        window.addSnackbar?.(`Editing: ${row.title}`, "info");
        break;
      case "delete":
        window.addSnackbar?.(`Deleted: ${row.title}`, "success");
        break;
      case "publish":
        window.addSnackbar?.(`Published: ${row.title}`, "success");
        break;
      case "unpublish":
        window.addSnackbar?.(`Unpublished: ${row.title}`, "info");
        break;
      case "details":
        window.addSnackbar?.(`Viewing details: ${row.title}`, "info");
        break;
      case "rollback":
        window.addSnackbar?.(`Restored: ${row.title}`, "success");
        break;
      default:
        break;
    }
  };

  return (
    <section className="cms-dashboard">
      <div className="dashboard-top">
        <div>
          <h1>Dashboard</h1>
          <p>Website Management Portal overview</p>
        </div>
        <button type="button" className="primary-action">
          Create Post
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <article key={item.title} className="stat-card">
            <div className="stat-head">
              <Image src={item.icon} alt={item.title} width={16} height={16} />
            </div>
            <p className="stat-title">{item.title}</p>
            <h3>{item.value}</h3>
            <span className="stat-trend">{item.trend}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <article className="panel chart-panel">
          <h3>Traffic & Engagement</h3>
          <div className="chart-placeholder">Chart Preview</div>
        </article>

        <article className="panel quick-actions">
          <h3>Quick Actions</h3>
          <button type="button" onClick={() => window.addSnackbar?.("Opening post editor", "success")}>
            Write New Blog
          </button>
          <button type="button" onClick={() => window.addSnackbar?.("Categories panel coming soon", "success")}>
            Manage Categories
          </button>
          <button type="button" onClick={() => window.addSnackbar?.("Comments moderation coming soon", "success")}>
            Review Comments
          </button>
        </article>
      </div>

      <article className="panel table-panel">
        <h3>Recent Posts</h3>
        <Table
          data={blogPostsData}
          columns={blogPostsColumns}
          onActionExecute={handleTableAction}
        />
      </article>
    </section>
  );
}
