"use client";

import "./page.css";
import Image from "next/image";
import { useState } from "react";
import Table from "@/assets/ui/tables/Table";
import PdpButton from "@/assets/buttons/button";

import BothArrowIcon from "@/assets/Images/icon/both-arrow.svg";
import SearchIcon from "@/assets/Images/icon/search-icon.svg";
import FilterIcon from "@/assets/Images/icon/filter-icon.svg";
import DownloadIcon from "@/assets/Images/icon/DownloadIcon.svg";
import PlusIcon from "@/assets/Images/icon/plus-icon.svg";

/* ================= USER DATA ================= */

const usersData = [
  {
    id: "01",
    name: "Pratyush Sharma",
    email: "sarah@example.com",
    role: "Admin",
    lastActive: "1 week ago",
    status: "created",
  },
  {
    id: "02",
    name: "Rohan Das",
    email: "mike@example.com",
    role: "Editor",
    lastActive: "1 week ago",
    status: "published",
  },
  {
    id: "03",
    name: "Kirk Chang",
    email: "priya@example.com",
    role: "Editor",
    lastActive: "1 day ago",
    status: "published",
  },
  {
    id: "04",
    name: "Priya Verma",
    email: "jonas@example.com",
    role: "Editor",
    lastActive: "5 minutes ago",
    status: "published",
  },
  {
    id: "05",
    name: "Neha Kapoor",
    email: "jonas@example.com",
    role: "Editor",
    lastActive: "1 day ago",
    status: "published",
  },
  {
    id: "06",
    name: "Vikram Patel",
    email: "jonas@example.com",
    role: "Editor",
    lastActive: "2 hours ago",
    status: "published",
  },
  {
    id: "07",
    name: "Sneha Reddy",
    email: "jonas@example.com",
    role: "Editor",
    lastActive: "3 hours ago",
    status: "published",
  },
];

/* ================= COMPONENT ================= */

export default function UserRolePage() {
  const [search, setSearch] = useState("");

  const handleTableAction = (actionKey, row) => {
    console.log(`Action: ${actionKey}`, row);
  };

  const userColumns = [
    { key: "id", label: "Sl. No.", width: "60px" },

    {
      key: "name",
      label: (
        <div className="sortable-head">
          Name
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "220px",
    },

    {
      key: "email",
      label: (
        <div className="sortable-head">
          Email
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "240px",
    },

    {
      key: "role",
      label: (
        <div className="sortable-head">
          Role
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "120px",
    },

    {
      key: "lastActive",
      label: (
        <div className="sortable-head">
          Last Active
          <Image src={BothArrowIcon} alt="sort" width={14} height={14} />
        </div>
      ),
      width: "160px",
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
      ),
    },
  ];

  return (
    <section className="cms-dashboard">
      <div className="main-card">

        {/* ================= TOP CONTROLS ================= */}

        <div className="top-controls">

          <PdpButton
            variant="primary"
            size="md"
            radius="sm"
            icon={PlusIcon}
            iconPosition="left"
          >
            Add User
          </PdpButton>

          <div className="right-controls">

            <div className="search-wrapper">
              <Image src={SearchIcon} alt="Search" width={16} height={16} />
              <input
                type="text"
                placeholder="Search"
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

        {/* ================= TABLE ================= */}

        <div className="table-wrapper">

          <Table
            data={usersData}
            columns={userColumns}
            onActionExecute={handleTableAction}
          />

        </div>

      </div>
    </section>
  );
}