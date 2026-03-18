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

export default function BlogDetailsModal({ blog, isOpen, onClose }) {

  if (!isOpen || !blog) return null;

  const descriptionText = getPlainTextFromHtml(blog.description);
  const coverFileName = extractFileName(blog.coverImage);

  return (
    <div className="blog-modal-overlay" onClick={onClose}>

      <div className="blog-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}

        <div className="blog-modal-header">

          <h3>Blog Details</h3>

          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Image
              src={CrossIcon}
              alt="close"
              width={18}
              height={18}
            />
          </button>

        </div>

        {/* BODY */}

        <div className="blog-details-grid">

          {/* Row 1: Title + Cover Image */}

          <div className="detail-row">
            <span>Blog Title</span>
            <a className="value-link">{blog.title || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Blog Cover Image</span>
            {blog.coverImage ? (
              <a
                href={blog.coverImage}
                target="_blank"
                rel="noopener noreferrer"
                className="value-link"
              >
                {coverFileName}
              </a>
            ) : (
              <a className="value-link">-</a>
            )}
          </div>

          {/* Row 2: Subtitle – full width */}

          <div className="detail-row full-width">
            <span>Blog Subtitle</span>
            <p className="subtitle-text">{blog.subtitle || "-"}</p>
          </div>

          {/* Section: Content Classification */}

          <div className="blog-section-header full-width">
            <span>Content Classification</span>
          </div>

          <div className="detail-row">
            <span>Group</span>
            <a className="value-link">{blog.group || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Category</span>
            <a className="value-link">{blog.category || "-"}</a>
          </div>

          <div className="detail-row">
            <span>Subcategory</span>
            <a className="value-link">{blog.subcategory || "-"}</a>
          </div>

          {/* spacer keeps the grid balanced */}
          <div aria-hidden="true" />

          {/* Section: Location Classification */}

          <div className="blog-section-header full-width">
            <span>Location Classification</span>
          </div>

          <div className="detail-row">
            <span>Country</span>
            <a className="value-link">{blog.country || "-"}</a>
          </div>

          <div className="detail-row">
            <span>State</span>
            <a className="value-link">{blog.state || "-"}</a>
          </div>

          <div className="detail-row">
            <span>District</span>
            <a className="value-link">{blog.district || "-"}</a>
          </div>

          <div className="detail-row">
            <span>City</span>
            <a className="value-link">{blog.city || "-"}</a>
          </div>

          {/* Section: Blog Description */}

          <div className="blog-section-header full-width">
            <span>Blog Description</span>
          </div>

          <div className="detail-row full-width">
            <p className="description-text">{descriptionText || "-"}</p>
          </div>

        </div>

      </div>

    </div>
  );
}
