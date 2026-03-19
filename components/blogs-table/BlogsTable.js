"use client";

import "./blogsTable.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import PdpButton from "@/assets/buttons/button";
import { UniversalTable } from "@/components/universal-table";
import { useBlog } from "@/hooks/useBlog";
import { getBlogById, updateBlog } from "@/services/blog.service";
import {
  getClusterById,
  getCategoryById,
  getSubCategoryById,
  fetchBlogDropdownOptions,
} from "@/services/cms.service";

import DeleteBlogModal from "@/assets/modals/DeleteBlogModal/DeleteBlogModal";
import BlogDetailsModal from "@/assets/modals/BlogDetailsModal/BlogDetailsModal";

import PlusIcon from "@/assets/Images/icon/plus-icon.svg";

/* ================= ACTION MENU LOGIC ================= */

const tableActions = [
  {
    key: "publish",
    label: "Publish",
    condition: (row) =>
      row.status === "created" ||
      row.status === "draft" ||
      row.status === "unpublished"
  },
  {
    key: "unpublish",
    label: "Unpublish",
    condition: (row) => row.status === "published"
  },
  {
    key: "draft",
    label: "Move to Draft",
    condition: (row) =>
      row.status === "published" ||
      row.status === "unpublished" ||
      row.status === "created"
  },
  {
    key: "edit",
    label: "Edit",
    condition: (row) =>
      row.status === "published" ||
      row.status === "unpublished" ||
      row.status === "draft" ||
      row.status === "created"
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
      row.status === "draft" ||
      row.status === "created"
  },
  {
    key: "rollback",
    label: "Roll Back",
    condition: (row) => row.status === "deleted"
  }
];

/* ================= DATA ================= */

const statuses = [
  "published",
  "draft",
  "created",
  "unpublished",
  "deleted"
];

const actionStatusMap = {
  publish: {
    nextStatus: "published",
    successMessage: "Blog published",
  },
  unpublish: {
    nextStatus: "unpublished",
    successMessage: "Blog unpublished",
  },
  draft: {
    nextStatus: "draft",
    successMessage: "Blog moved to draft",
  },
  delete: {
    nextStatus: "deleted",
    successMessage: "Blog deleted",
  },
  rollback: {
    nextStatus: "created",
    successMessage: "Blog rolled back to created",
  },
};

function normalizeBlogRow(item, index = 0) {
  const rawStatus = String(
    item?.blog_status || item?.status || item?.post_status || "created"
  ).toLowerCase();

  return {
    id: item?.id || item?.blog_id || index + 1,
    title: item?.title || item?.blog_title || item?.name || "Untitled Blog",
    subtitle: item?.subtitle || item?.obj_1 || "",
    description: item?.description || "",
    author: item?.author || item?.author_name || item?.created_by || "Unknown author",
    lastUpdated:
      item?.lastUpdated ||
      item?.updated_at ||
      item?.updatedAt ||
      item?.created_at ||
      item?.createdAt ||
      new Date().toISOString().split("T")[0],
    createdAt: item?.created_at || item?.createdAt || "",
    deletedAt: item?.deleted_at || item?.deletedAt || "",
    slug: item?.slug || "",
    timeToRead: item?.time_to_read ?? item?.timeToRead ?? null,
    viewCount: item?.view_count ?? item?.viewCount ?? 0,
    carouselStatus: item?.carousel_status ?? item?.carouselStatus ?? null,
    status: statuses.includes(rawStatus) ? rawStatus : "created",
  };
}

/* ================= COMPONENT ================= */

export default function BlogsTable() {

  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState("all");
  const { posts, loading, refetch } = useBlog({
    status: activeStatus,
    page: 1,
    limit: 200,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [detailsBlog, setDetailsBlog] = useState(null);

  const applyStatusUpdate = async (row, actionKey) => {
    const actionConfig = actionStatusMap[actionKey];

    if (!row?.id || !actionConfig) {
      return;
    }

    setIsActionLoading(true);

    try {
      await updateBlog(row.id, {
        blog_status: actionConfig.nextStatus,
      });

      await refetch();
      window.addSnackbar?.(actionConfig.successMessage, "success");
    } catch (error) {
      window.addSnackbar?.(error.message || "Failed to update blog status", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const normalizedBlogRows = useMemo(() => {
    const sourceRows = Array.isArray(posts) ? posts : [];

    return sourceRows.map((item, index) => normalizeBlogRow(item, index));
  }, [posts]);

  const statusOptions = useMemo(
    () => [
      { key: "all", label: "All Blogs" },
      { key: "draft", label: "Draft" },
      { key: "created", label: "Created" },
      { key: "published", label: "Published" },
      { key: "unpublished", label: "Unpublished" },
      { key: "deleted", label: "Deleted" },
    ],
    []
  );

  const handleTableAction = async (actionKey, row) => {

    if (actionKey === "delete") {
      setSelectedBlog(row);
      setDeleteModalOpen(true);
      return;
    }

    if (actionKey === "details") {
      setIsActionLoading(true);

      try {
        const raw = await getBlogById(row.id);
        const b = raw || {};

        const groupId    = b.cluster_id      ? String(b.cluster_id)      : null;
        const catId      = b.category_id     ? String(b.category_id)     : null;
        const subCatId   = b.sub_category_id ? String(b.sub_category_id) : null;
        const countryId  = b.obj_2 ? String(b.obj_2) : null;
        const stateId    = b.obj_3 ? String(b.obj_3) : null;
        const districtId = b.obj_4 ? String(b.obj_4) : null;
        const cityId     = b.obj_5 ? String(b.obj_5) : null;

        const [cluster, category, subCategory, countryOptions] = await Promise.all([
          groupId   ? getClusterById(groupId).catch(() => null)                   : null,
          catId     ? getCategoryById(catId).catch(() => null)                    : null,
          subCatId  ? getSubCategoryById(subCatId).catch(() => null)              : null,
          countryId ? fetchBlogDropdownOptions("country").catch(() => [])         : Promise.resolve([]),
        ]);

        const countryLabel = countryId
          ? countryOptions.find((o) => String(o.value) === countryId)?.label || countryId
          : null;

        let stateLabel    = stateId    || null;
        let districtLabel = districtId || null;
        let cityLabel     = cityId     || null;

        if (countryId && stateId) {
          const stateOptions = await fetchBlogDropdownOptions("state", { country: countryId }).catch(() => []);
          stateLabel = stateOptions.find((o) => String(o.value) === stateId)?.label || stateId;

          if (districtId) {
            const districtOptions = await fetchBlogDropdownOptions("district", { country: countryId, state: stateId }).catch(() => []);
            districtLabel = districtOptions.find((o) => String(o.value) === districtId)?.label || districtId;

            if (cityId) {
              const cityOptions = await fetchBlogDropdownOptions("city", { country: countryId, state: stateId, district: districtId }).catch(() => []);
              cityLabel = cityOptions.find((o) => String(o.value) === cityId)?.label || cityId;
            }
          }
        }

        setDetailsBlog({
          title:       b.blog_title || b.title || row.title,
          coverImage:  b.img_1 || null,
          subtitle:    b.obj_1 || "",
          group:       cluster?.name      || null,
          category:    category?.name     || null,
          subcategory: subCategory?.name  || null,
          country:     countryLabel,
          state:       stateLabel,
          district:    districtLabel,
          city:        cityLabel,
          description: b.description || "",
        });
        setDetailsModalOpen(true);
      } catch (error) {
        window.addSnackbar?.(error.message || "Failed to fetch blog details", "error");
      } finally {
        setIsActionLoading(false);
      }

      return;
    }

    if (actionKey === "edit") {
      router.push(`/blog/blogs/${row.id}/edit`);
      return;
    }

    if (actionStatusMap[actionKey]) {
      await applyStatusUpdate(row, actionKey);
      return;
    }

    console.log(`Action: ${actionKey}`, row);
  };

  const filteredData = useMemo(() => {

    let data = normalizedBlogRows;

    if (activeStatus !== "all") {
      data = data.filter((item) => item.status === activeStatus);
    }

    return data;

  }, [activeStatus, normalizedBlogRows]);

  const blogPostsColumns = [
    {
      field: "title",
      label: "Blog Title",
      sortable: true
    },

    {
      field: "author",
      label: "Author",
      sortable: true
    },

    {
      field: "lastUpdated",
      label: "Last Updated",
      type: "date",
      sortable: true
    },

    {
      field: "status",
      label: "Status",
      sortable: true,
      render: (value, row) => (
        <span className={`status-pill ${row.status}`}>
          {value}
        </span>
      )
    }
  ];

  const tableActionsForRows = tableActions.map((action) => ({
    ...action,
    onClick: (row) => handleTableAction(action.key, row),
  }));

  const toolbarLeft = (
    <div className="blogs-toolbarLeft">
      <Link href="/blog/blogs/create" className="blogs-createLink">
        <PdpButton
          variant="primary"
          size="md"
          radius="sm"
          icon={PlusIcon}
          iconPosition="left"
          className="blogs-createBtn"
        >
          Create Blog
        </PdpButton>
      </Link>

      <label className="blogs-statusFilter">
        <span className="blogs-statusFilterLabel">Status</span>
        <select
          value={activeStatus}
          onChange={(event) => setActiveStatus(event.target.value)}
          aria-label="Filter blogs by status"
        >
          {statusOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <section className="blogs-table-wrapper">

      <div className="main-card">

        <div className="table-wrapper">

          <UniversalTable
            variant="data"
            rows={filteredData}
            columns={blogPostsColumns}
            // title="Blogs"
            toolbarLeft={toolbarLeft}
            searchPlaceholder="Search blogs by title or author"
            actions={tableActionsForRows}
            rowKey="id"
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            breakpoint={768}
            enableFilters={true}
            showFilterButton={true}
            showActions={true}
            showFooter={true}
            exportFileBaseName="blogs"
            bodyHeight={520}
            loading={loading || isActionLoading}
          />

        </div>

      </div>

      {/* ================= DELETE MODAL ================= */}

      <DeleteBlogModal
        isOpen={deleteModalOpen}
        blogTitle={selectedBlog?.title}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await applyStatusUpdate(selectedBlog, "delete");
          setDeleteModalOpen(false);
          setSelectedBlog(null);
        }}
      />

      {/* ================= DETAILS MODAL ================= */}

      <BlogDetailsModal
        isOpen={detailsModalOpen}
        blog={detailsBlog}
        onClose={() => { setDetailsModalOpen(false); setDetailsBlog(null); }}
      />

    </section>
  );
}
