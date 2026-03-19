"use client";

import "./BlogDetailsModal.css";
import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";
import { docToPlainText, htmlToDoc } from "@/components/pdp-rich-editor";

function getPlainTextFromHtml(value) {
  if (!value) {
    return "";
  }

  try {
    return docToPlainText(htmlToDoc(String(value))).trim();
  } catch {
    return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

function extractFileName(url) {
  if (!url) return null;
  return String(url).split("?")[0].split("/").pop() || null;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function BlogDetailsModal({ blog, isOpen, onClose }) {
  if (!isOpen || !blog) return null;

  const descriptionText = getPlainTextFromHtml(blog.description);
  const coverFileName = extractFileName(blog.coverImage);
  const summaryItems = [
    { label: "Author", value: formatValue(blog.author) },
    { label: "Last Updated", value: formatValue(blog.lastUpdated) },
    { label: "Status", value: formatStatus(blog.status), tone: blog.status },
  ];
  const contentItems = [
    { label: "Group", value: formatValue(blog.group) },
    { label: "Category", value: formatValue(blog.category) },
    { label: "Subcategory", value: formatValue(blog.subcategory) },
  ];
  const locationItems = [
    { label: "Country", value: formatValue(blog.country) },
    { label: "State", value: formatValue(blog.state) },
    { label: "District", value: formatValue(blog.district) },
    { label: "City", value: formatValue(blog.city) },
  ];

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div
        className="blog-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Blog details"
      >
        <div className="blog-modal-header">
          <h3>Blog Details</h3>
          <button
            className="blog-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Image src={CrossIcon} alt="close" width={18} height={18} />
          </button>
        </div>

        <div className="blog-details-grid">
          <section className="blog-hero blog-grid-full">
            <div className="blog-hero-copy">
              <span className="blog-section-kicker">Blog Title</span>
              <h4>{formatValue(blog.title)}</h4>
              <p>{formatValue(blog.subtitle)}</p>
            </div>

            <div className="blog-summary-pills">
              {summaryItems.map((item) => (
                <div className="blog-summary-pill" key={item.label}>
                  <span>{item.label}</span>
                  {item.label === "Status" ? (
                    <strong className={`status-pill ${item.tone || "created"}`}>{item.value}</strong>
                  ) : (
                    <strong>{item.value}</strong>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="blog-detail-card">
            <span className="blog-detail-label">Blog Cover Image</span>
            {blog.coverImage ? (
              <a
                href={blog.coverImage}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-value-link"
              >
                {coverFileName}
              </a>
            ) : (
              <p className="blog-detail-value">-</p>
            )}
          </div>

          <div className="blog-detail-card">
            <span className="blog-detail-label">Blog Description</span>
            <p className="blog-description-text">{descriptionText || "-"}</p>
          </div>

          <section className="blog-detail-section blog-grid-full">
            <div className="blog-section-header">
              <span>Content Classification</span>
            </div>
            <div className="blog-section-grid">
              {contentItems.map((item) => (
                <div className="blog-detail-card" key={item.label}>
                  <span className="blog-detail-label">{item.label}</span>
                  <p className="blog-detail-value">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="blog-detail-section blog-grid-full">
            <div className="blog-section-header">
              <span>Location Classification</span>
            </div>
            <div className="blog-section-grid">
              {locationItems.map((item) => (
                <div className="blog-detail-card" key={item.label}>
                  <span className="blog-detail-label">{item.label}</span>
                  <p className="blog-detail-value">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
