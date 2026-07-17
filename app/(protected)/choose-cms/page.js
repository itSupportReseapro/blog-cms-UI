"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BLOG_APP_OPTIONS, setCurrentBlogAppKey } from "@/lib/blogAppContext";
import PubmanuLogo from "@/assets/Images/pubmanu-logo.svg";
import ScholarHangoutLogo from "@/assets/Images/scholar-hangout-logo.svg";
import SwastyarekhaLogo from "@/assets/Images/swastyarekha-logo.svg";
import "./choose-cms.css";

const logoByKey = {
  pubmanu: PubmanuLogo,
  "scholar-hangout": ScholarHangoutLogo,
  swastyarekha: SwastyarekhaLogo,
};

const descriptionByKey = {
  pubmanu: "Manage Pubmanu blog content, categories, pages, and publishing flow.",
  "scholar-hangout":
    "Manage Scholar Hangout blog content, categories, pages, and publishing flow.",
  swastyarekha:
    "Manage Swastyarekha blog content, categories, pages, and publishing flow.",
};

export default function ChooseCmsPage() {
  const router = useRouter();

  const handleChoose = (key) => {
    setCurrentBlogAppKey(key);
    router.replace("/blog/dashboard");
  };

  return (
    <main className="chooseCms">
      <section className="chooseCms-panel" aria-labelledby="choose-cms-title">
        <div className="chooseCms-header">
          <p className="chooseCms-eyebrow">Content Management System</p>
          <h1 id="choose-cms-title">Choose your CMS</h1>
          <p>Select the workspace you want to manage for this session.</p>
        </div>

        <div className="chooseCms-grid">
          {BLOG_APP_OPTIONS.map((app) => (
            <button
              key={app.key}
              type="button"
              className="chooseCms-card"
              onClick={() => handleChoose(app.key)}
            >
              <span className="chooseCms-logoWrap">
                <Image
                  src={logoByKey[app.key]}
                  alt={`${app.label} logo`}
                  className="chooseCms-logo"
                  priority
                />
              </span>
              <span className="chooseCms-cardBody">
                <span className="chooseCms-cardTitle">{app.label} CMS</span>
                <span className="chooseCms-cardText">
                  {descriptionByKey[app.key]}
                </span>
              </span>
              <span className="chooseCms-action">Open CMS</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
