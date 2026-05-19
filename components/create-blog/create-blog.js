"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PdpButton from "@/assets/buttons/button";
import CmsTimeline from "@/components/timeline/timeline";
import "./create-blog.css";
import { defaultDoc, htmlToDoc } from "@/components/pdp-rich-editor-2";
import {
  createBlogDropdownOption,
  fetchBlogDropdownOptions,
  getCategoryById,
  getClusterById,
  getSubCategoryById,
  uploadCmsAsset,
} from "@/services/cms.service";
import { createBlog, getBlogById, updateBlog } from "@/services/blog.service";
import { DEPENDENT_DROPDOWNS, DROPDOWN_FIELDS } from "./createBlog.constants";
import {
  estimateReadTime,
  extractFileName,
  getSelectedLabel,
  resolveAuthorName,
  toSlug,
} from "./createBlog.utils";
import CreateBlogStepOne from "./CreateBlogStepOne";
import CreateBlogStepTwo from "./CreateBlogStepTwo";

export default function CreateBlog({ blogId = null }) {

  const router = useRouter();
  const normalizedBlogId = blogId ? String(blogId) : null;
  const isEdit = normalizedBlogId !== null;
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cover: null,
    coverName: "",
    group: "",
    category: "",
    subcategory: "",
    country: "",
    state: "",
    district: "",
    city: "",
    contentDoc: defaultDoc(),
    content: "",
    blogStatus: "created",
  });

  const [dropdownState, setDropdownState] = useState({
    group: { loading: false, options: [] },
    category: { loading: false, options: [] },
    subcategory: { loading: false, options: [] },
    country: { loading: false, options: [] },
    state: { loading: false, options: [] },
    district: { loading: false, options: [] },
    city: { loading: false, options: [] },
  });

  const parentParams = useMemo(
    () => ({
      group: formData.group,
      category: formData.category,
      country: formData.country,
      state: formData.state,
      district: formData.district,
    }),
    [formData.category, formData.country, formData.district, formData.group, formData.state]
  );

  const coverInputValue = useMemo(() => {
    return formData.coverName ? { name: formData.coverName } : { name: "" };
  }, [formData.coverName]);

  const setDropdownLoading = (field, loading) => {
    setDropdownState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        loading,
      },
    }));
  };

  const setDropdownOptions = (field, options) => {
    setDropdownState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        options,
      },
    }));
  };

  const getDropdownLabel = (field, value) => getSelectedLabel(dropdownState, field, value);

  const loadDropdown = async (field, customParams) => {
    setDropdownLoading(field, true);

    try {
      const options = await fetchBlogDropdownOptions(field, customParams || parentParams);
      setDropdownOptions(field, options);
    } catch (error) {
      window.addSnackbar?.(error.message || "Failed to load options", "error");
    } finally {
      setDropdownLoading(field, false);
    }
  };

  const addDropdownOption = async (field, value) => {
    if (!value) {
      return;
    }

    try {
      const createdOption = await createBlogDropdownOption(field, value, parentParams);

      setDropdownState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          options: [...prev[field].options, createdOption],
        },
      }));

      handleChange({ target: { name: field, value: createdOption.value } });

      const successLabel =
        typeof value === "string" ? value : value?.name || createdOption.label || "Value";
      window.addSnackbar?.(`${successLabel} added`, "success");
    } catch (error) {
      window.addSnackbar?.(error.message || "Failed to add option", "error");
    }
  };

  const resetDependentDropdowns = (field) => {
    const targets = DEPENDENT_DROPDOWNS[field] || [];

    if (!targets.length) {
      return;
    }

    setDropdownState((prev) => {
      const next = { ...prev };
      targets.forEach((target) => {
        next[target] = {
          ...next[target],
          options: [],
        };
      });
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "group") {
        resetDependentDropdowns("group");
        return {
          ...prev,
          group: value,
          category: "",
          subcategory: "",
        };
      }

      if (name === "category") {
        resetDependentDropdowns("category");
        return {
          ...prev,
          category: value,
          subcategory: "",
        };
      }

      if (name === "country") {
        resetDependentDropdowns("country");
        return {
          ...prev,
          country: value,
          state: "",
          district: "",
          city: "",
        };
      }

      if (name === "state") {
        resetDependentDropdowns("state");
        return {
          ...prev,
          state: value,
          district: "",
          city: "",
        };
      }

      if (name === "district") {
        resetDependentDropdowns("district");
        return {
          ...prev,
          district: value,
          city: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleCoverUpload = async (e) => {
    const candidate = e?.target?.files?.[0] || e?.target?.value || null;
    const file =
      typeof File !== "undefined" && candidate instanceof File ? candidate : null;

    if (!file) {
      return;
    }

    try {
      window.addSnackbar?.("Uploading cover image...", "info");
      const { url } = await uploadCmsAsset(file);

      setFormData((prev) => ({
        ...prev,
        cover: url,
        coverName: file.name,
      }));

      window.addSnackbar?.("Cover image uploaded successfully", "success");
    } catch (error) {
      console.error("Cover image upload failed:", error);
      window.addSnackbar?.("Cover image upload failed", "error");
    }
  };

  const handleBack = () => {
    router.push("/blog/blogs");
  };


  const buildBlogPayload = (statusOverride) => {
    const authorName = resolveAuthorName();

    return {
      app_id: 12,
      user_id: null,
      cluster_id: formData.group ? Number(formData.group) : null,
      category_id: formData.category ? Number(formData.category) : null,
      sub_category_id: formData.subcategory ? Number(formData.subcategory) : null,
      blog_title: formData.title?.trim(),
      author_name: authorName,
      description: formData.content || "",
      time_to_read: estimateReadTime(formData.content || formData.subtitle),
      blog_status: statusOverride || formData.blogStatus || "created",
      carousel_status: 1,
      view_count: 0,
      img_1: formData.cover || "",
      img_2: "",
      slug: toSlug(formData.title),
      obj_1: formData.subtitle || "",
      obj_2: getDropdownLabel("country", formData.country),
      obj_3: getDropdownLabel("state", formData.state),
      obj_4: getDropdownLabel("district", formData.district),
      obj_5: getDropdownLabel("city", formData.city),
      status: 1,
      created_by: authorName,
    };
  };

  const submitBlog = async (statusOverride, navigateOnSuccess = true) => {
    if (!formData.title?.trim()) {
      window.addSnackbar?.("Blog title is required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildBlogPayload(statusOverride);

      if (isEdit) {
        await updateBlog(normalizedBlogId, payload);
      } else {
        await createBlog(payload);
      }

      setFormData((prev) => ({
        ...prev,
        blogStatus: payload.blog_status,
      }));

      window.addSnackbar?.(
        isEdit ? "Blog updated successfully" : "Blog created successfully",
        "success"
      );

      if (navigateOnSuccess) {
        router.push("/blog/blogs");
      }
    } catch (error) {
      console.error("Blog save failed:", error);
      window.addSnackbar?.(error.message || "Failed to save blog", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadEditBlog() {
      if (!isEdit || !blogId) {
        return;
      }

      setIsLoadingBlog(true);

      try {
        const blog = await getBlogById(normalizedBlogId);

        if (!blog || !mounted) {
          return;
        }

        const groupId = blog.cluster_id ? String(blog.cluster_id) : "";
        const categoryId = blog.category_id ? String(blog.category_id) : "";
        const subCategoryId = blog.sub_category_id ? String(blog.sub_category_id) : "";

        const savedLocation = {
          country: blog.obj_2 ? String(blog.obj_2) : "",
          state: blog.obj_3 ? String(blog.obj_3) : "",
          district: blog.obj_4 ? String(blog.obj_4) : "",
          city: blog.obj_5 ? String(blog.obj_5) : "",
        };

        const resolveSelectedValue = (savedValue, options = []) => {
          if (!savedValue) {
            return "";
          }

          const exactByValue = options.find(
            (option) => String(option.value) === String(savedValue)
          );
          if (exactByValue) {
            return String(exactByValue.value);
          }

          const exactByLabel = options.find(
            (option) =>
              String(option.label || "").trim().toLowerCase() ===
              String(savedValue).trim().toLowerCase()
          );
          if (exactByLabel) {
            return String(exactByLabel.value);
          }

          return String(savedValue);
        };

        const countryOptions = await fetchBlogDropdownOptions(DROPDOWN_FIELDS.country);
        const resolvedCountryValue = resolveSelectedValue(savedLocation.country, countryOptions);

        const stateOptions = resolvedCountryValue
          ? await fetchBlogDropdownOptions(DROPDOWN_FIELDS.state, {
              country: resolvedCountryValue,
            })
          : [];
        const resolvedStateValue = resolveSelectedValue(savedLocation.state, stateOptions);

        const districtOptions = resolvedStateValue
          ? await fetchBlogDropdownOptions(DROPDOWN_FIELDS.district, {
              country: resolvedCountryValue,
              state: resolvedStateValue,
            })
          : [];
        const resolvedDistrictValue = resolveSelectedValue(savedLocation.district, districtOptions);

        const cityOptions = resolvedDistrictValue
          ? await fetchBlogDropdownOptions(DROPDOWN_FIELDS.city, {
              country: resolvedCountryValue,
              state: resolvedStateValue,
              district: resolvedDistrictValue,
            })
          : [];
        const resolvedCityValue = resolveSelectedValue(savedLocation.city, cityOptions);

        setFormData((prev) => ({
          ...prev,
          title: blog.blog_title || "",
          subtitle: blog.obj_1 || "",
          cover: blog.img_1 || null,
          coverName: extractFileName(blog.img_1),
          group: groupId,
          category: categoryId,
          subcategory: subCategoryId,
          country: resolvedCountryValue,
          state: resolvedStateValue,
          district: resolvedDistrictValue,
          city: resolvedCityValue,
          content: blog.description || "",
          contentDoc: blog.description ? htmlToDoc(blog.description) : defaultDoc(),
          blogStatus: blog.blog_status || "created",
        }));

        const [cluster, category, subCategory] = await Promise.all([
          groupId ? getClusterById(groupId) : null,
          categoryId ? getCategoryById(categoryId) : null,
          subCategoryId ? getSubCategoryById(subCategoryId) : null,
        ]);

        if (!mounted) {
          return;
        }

        setDropdownState((prev) => ({
          ...prev,
          group: {
            ...prev.group,
            options: cluster ? [{ value: String(cluster.id), label: cluster.name }] : prev.group.options,
          },
          category: {
            ...prev.category,
            options: category ? [{ value: String(category.id), label: category.name }] : prev.category.options,
          },
          subcategory: {
            ...prev.subcategory,
            options: subCategory
              ? [{ value: String(subCategory.id), label: subCategory.name }]
              : prev.subcategory.options,
          },
          country: {
            ...prev.country,
            options: countryOptions,
          },
          state: {
            ...prev.state,
            options: stateOptions,
          },
          district: {
            ...prev.district,
            options: districtOptions,
          },
          city: {
            ...prev.city,
            options: cityOptions,
          },
        }));
      } catch (error) {
        console.error("Failed to load blog:", error);
        window.addSnackbar?.(error.message || "Failed to load blog", "error");
      } finally {
        if (mounted) {
          setIsLoadingBlog(false);
        }
      }
    }

    loadEditBlog();

    return () => {
      mounted = false;
    };
  }, [isEdit, normalizedBlogId]);

  return (
    <div className="create-blog-wrapper">

      {/* TOP HEADER */}

      <div className="create-blog-top">

        <div className="left-section">
          {step === 2 && (
            <button 
              className="back-button"
              onClick={() => setStep(1)}
            >
              ← {isEdit ? "Edit Blog" : "Create Blog"}
            </button>
          )}
          {step === 1 && (
            <button 
              className="back-button"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}
        </div>

        <CmsTimeline currentStep={step} />

        <div className="right-section">

          {step === 2 && (
            <PdpButton variant="outline" size="sm" onClick={() => setStep(1)}>
              ← Back
            </PdpButton>
          )}

          <PdpButton
            variant="outline"
            size="sm"
            onClick={() => submitBlog("draft", false)}
            disabled={isSubmitting || isLoadingBlog}
          >
            Save as draft
          </PdpButton>

          {step === 1 && (
            <PdpButton variant="primary" size="sm" onClick={() => setStep(2)}>
              Next →
            </PdpButton>
          )}

          {step === 2 && (
            <PdpButton 
              variant="primary" 
              size="sm"
              onClick={() => submitBlog(undefined, true)}
              disabled={isSubmitting || isLoadingBlog}
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </PdpButton>
          )}

        </div>
      </div>

      {/* STEP 1 */}

      {step === 1 && (
        <CreateBlogStepOne
          formData={formData}
          coverInputValue={coverInputValue}
          dropdownState={dropdownState}
          getSelectedLabel={getDropdownLabel}
          handleChange={handleChange}
          handleCoverUpload={handleCoverUpload}
          loadDropdown={loadDropdown}
          addDropdownOption={addDropdownOption}
        />
      )}


      {/* STEP 2 */}

      {step === 2 && (
        <CreateBlogStepTwo
          contentDoc={formData.contentDoc}
          onDocChange={(doc) =>
            setFormData((prev) => ({
              ...prev,
              contentDoc: doc,
            }))
          }
          onHtmlChange={(html) =>
            setFormData((prev) => ({
              ...prev,
              content: html,
            }))
          }
        />
      )}

    </div>
  );
}
