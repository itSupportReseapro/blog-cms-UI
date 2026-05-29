"use client";

import "./BlogDetailsModal.css";
import Image from "next/image";
import CrossIcon from "@/assets/Images/icon/cross-icon.svg";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
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

  const summaryItems = [
    { label: "Author", value: formatValue(blog.author) },
    { label: "Last Updated", value: formatDateTime(blog.lastUpdated) },
    { label: "Status", value: formatStatus(blog.status), tone: blog.status },
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

        </div>
      </div>
    </div>
  );
}
