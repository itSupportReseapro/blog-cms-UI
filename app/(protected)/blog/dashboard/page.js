"use client";

import "./page.css";
import Image from "next/image";
import PeopleIcon from "@/assets/Images/icon/peopleICON.svg";
import WebsiteIcon from "@/assets/Images/icon/websiteICON.svg";
import SettingsIcon from "@/assets/Images/icon/settingsICON.svg";
import PlusIcon from "@/assets/Images/icon/plusICON.svg";

export default function BlogDashboardPage() {
  const stats = [
    { title: "Total Posts", value: "128", trend: "+12 this week", icon: WebsiteIcon },
    { title: "Published", value: "96", trend: "+8 this week", icon: PeopleIcon },
    { title: "Comments", value: "1,245", trend: "+21 today", icon: SettingsIcon },
    { title: "Categories", value: "14", trend: "2 new", icon: PlusIcon },
  ];

  const recentPosts = [
    { title: "How to scale editorial workflow", status: "Published", date: "20 Feb 2026" },
    { title: "Top CMS trends in 2026", status: "Draft", date: "19 Feb 2026" },
    { title: "SEO checklist for blog teams", status: "Review", date: "18 Feb 2026" },
    { title: "Content calendar planning guide", status: "Published", date: "16 Feb 2026" },
  ];

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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.title}>
                  <td>{post.title}</td>
                  <td>
                    <span className={`status-pill ${post.status.toLowerCase()}`}>{post.status}</span>
                  </td>
                  <td>{post.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
