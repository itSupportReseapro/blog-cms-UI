"use client";

import { useEffect, useMemo, useState } from "react";
import PdpButton from "@/assets/buttons/button";
import { RichEditor } from "@/components/pdp-rich-editor-2";
import useAboutUs, { createInitialAboutUsState } from "@/hooks/about-us/use-about-us";
import { uploadCmsAsset } from "@/services/cms.service";
import "./page.css";

const TABS = [
  { key: "about", label: "About Us" },
  { key: "missionVision", label: "Mission and Vision" },
  { key: "values", label: "Our Values" },
];

function toDisplayFileName(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  try {
    const withoutQuery = raw.split("?")[0];
    const fileName = withoutQuery.split("/").pop() || raw;
    return decodeURIComponent(fileName);
  } catch {
    return raw;
  }
}

function UploadField({ id, placeholder, value, onChange }) {
  const displayValue = toDisplayFileName(value);

  return (
    <div className="about-upload-block">
      <div className="about-upload-input-wrap">
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          className="about-input"
          style={{ cursor: "pointer" }}
          onClick={() => document.getElementById(id)?.click()}
        />

        <label htmlFor={id} className="about-upload-trigger" aria-label={`Upload ${placeholder}`}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M16.5 6.5L9 14C7.89543 15.1046 7.89543 16.8954 9 18C10.1046 19.1046 11.8954 19.1046 13 18L20.5 10.5C22.7091 8.29086 22.7091 4.70914 20.5 2.5C18.2909 0.290861 14.7091 0.290861 12.5 2.5L4.5 10.5C1.73858 13.2614 1.73858 17.7386 4.5 20.5C7.26142 23.2614 11.7386 23.2614 14.5 20.5L21 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>

        <input
          id={id}
          type="file"
          className="about-hidden-file"
          accept=".png,.svg,.jpg,.jpeg"
          onChange={onChange}
        />
      </div>

      <p className="about-upload-note">Accepted formats: png, svg, Jpeg * Max size: 2MB</p>
    </div>
  );
}

function MissionVisionSection({
  heading,
  title,
  imageName,
  description,
  imageInputId,
  onTitleChange,
  onImageChange,
  onDescriptionChange,
}) {
  return (
    <section className="about-subsection-card">
      <h4>{heading}</h4>

      <div className="about-two-col">
        <input
          type="text"
          className="about-input"
          placeholder="Title"
          value={title}
          onChange={onTitleChange}
        />

        <UploadField
          id={imageInputId}
          placeholder="Image"
          value={imageName}
          onChange={onImageChange}
        />
      </div>

      <div className="about-editor-wrap">
        <RichEditor
          value={description}
          onChange={onDescriptionChange}
          className="cms-rich-editor"
          showFooter
          placeholder="Your privacy policy content goes here. Add detailed information about data collection, usage, and user rights."
        />
      </div>
    </section>
  );
}

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("about");
  const [state, setState] = useState(() => createInitialAboutUsState());
  const { loadAboutUsContent, saveAboutUsContent, loading, error } = useAboutUs();

  const tabLabels = useMemo(() => TABS, []);

  useEffect(() => {
    let mounted = true;

    async function loadCmsSections() {
      const nextState = await loadAboutUsContent();

      if (!mounted || !nextState) {
        return;
      }

      setState(nextState);
    }

    loadCmsSections();

    return () => {
      mounted = false;
    };
  }, []);

  const handleClear = () => {
    setState(createInitialAboutUsState());
  };

  const handleSave = async () => {
    const result = await saveAboutUsContent(state);

    if (result) {
      window.addSnackbar("About Us content saved successfully!", "success");
    }
  };

  useEffect(() => {
    if (error) {
      window.addSnackbar(error, "error");
    }
  }, [error]);

  const updateValueItem = (index, key, value) => {
    setState((prev) => {
      const nextItems = [...prev.values.items];
      nextItems[index] = {
        ...nextItems[index],
        [key]: value,
      };

      return {
        ...prev,
        values: {
          ...prev.values,
          items: nextItems,
        },
      };
    });
  };

  const handleAssetUpload = async (file, onSuccess, label) => {
    if (!file) {
      return;
    }

    try {
      window.addSnackbar?.(`Uploading ${label}...`, "info");
      const { url } = await uploadCmsAsset(file);
      onSuccess(url);
      window.addSnackbar?.(`${label} uploaded successfully`, "success");
    } catch (uploadError) {
      console.error(`${label} upload failed:`, uploadError);
      window.addSnackbar?.(`${label} upload failed`, "error");
    }
  };

  return (
    <section className="about-page">
      <div className="about-card">

        <div className="about-header">
          <h2>About Us</h2>

          <div className="about-actions">
            <PdpButton
              variant="outline"
              size="md"
              radius="sm"
              onClick={handleClear}
              disabled={loading}
            >
              Clear All
            </PdpButton>

            <PdpButton
              variant="primary"
              size="md"
              radius="sm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </PdpButton>
          </div>
        </div>

        <div className="about-tabs" role="tablist" aria-label="About us sections">
          {tabLabels.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`about-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="about-tab-content">
          {activeTab === "about" && (
            <div className="about-content about-stack-gap">
              <div className="about-two-col">
                <input
                  type="text"
                  className="about-input"
                  placeholder="Title"
                  value={state.about.title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setState((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        title: value,
                      },
                    }));
                  }}
                />

                <UploadField
                  id="about-image"
                  placeholder="Image"
                  value={state.about.imageName}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    handleAssetUpload(
                      file,
                      (uploadedUrl) => {
                        setState((prev) => ({
                          ...prev,
                          about: {
                            ...prev.about,
                            imageFile: null,
                            imageName: uploadedUrl,
                          },
                        }));
                      },
                      "about image"
                    );
                  }}
                />
              </div>

              <textarea
                className="about-textarea"
                placeholder="Sub Text"
                value={state.about.subText}
                onChange={(event) => {
                  const value = event.target.value;
                  setState((prev) => ({
                    ...prev,
                    about: {
                      ...prev.about,
                      subText: value,
                    },
                  }));
                }}
              />

              <div className="about-editor-wrap">
                <RichEditor
                  value={state.about.description}
                  onChange={(doc) => {
                    setState((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        description: doc,
                      },
                    }));
                  }}
                  className="cms-rich-editor"
                  showFooter
                  placeholder="Your privacy policy content goes here. Add detailed information about data collection, usage, and user rights."
                />
              </div>
            </div>
          )}

          {activeTab === "missionVision" && (
            <div className="about-content about-stack-gap">
              <MissionVisionSection
                heading="Our Mission"
                title={state.missionVision.mission.title}
                imageName={state.missionVision.mission.imageName}
                description={state.missionVision.mission.description}
                imageInputId="mission-image"
                onTitleChange={(event) => {
                  const value = event.target.value;
                  setState((prev) => ({
                    ...prev,
                    missionVision: {
                      ...prev.missionVision,
                      mission: {
                        ...prev.missionVision.mission,
                        title: value,
                      },
                    },
                  }));
                }}
                onImageChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  handleAssetUpload(
                    file,
                    (uploadedUrl) => {
                      setState((prev) => ({
                        ...prev,
                        missionVision: {
                          ...prev.missionVision,
                          mission: {
                            ...prev.missionVision.mission,
                            imageFile: null,
                            imageName: uploadedUrl,
                          },
                        },
                      }));
                    },
                    "mission image"
                  );
                }}
                onDescriptionChange={(doc) => {
                  setState((prev) => ({
                    ...prev,
                    missionVision: {
                      ...prev.missionVision,
                      mission: {
                        ...prev.missionVision.mission,
                        description: doc,
                      },
                    },
                  }));
                }}
              />

              <MissionVisionSection
                heading="Our Vision"
                title={state.missionVision.vision.title}
                imageName={state.missionVision.vision.imageName}
                description={state.missionVision.vision.description}
                imageInputId="vision-image"
                onTitleChange={(event) => {
                  const value = event.target.value;
                  setState((prev) => ({
                    ...prev,
                    missionVision: {
                      ...prev.missionVision,
                      vision: {
                        ...prev.missionVision.vision,
                        title: value,
                      },
                    },
                  }));
                }}
                onImageChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  handleAssetUpload(
                    file,
                    (uploadedUrl) => {
                      setState((prev) => ({
                        ...prev,
                        missionVision: {
                          ...prev.missionVision,
                          vision: {
                            ...prev.missionVision.vision,
                            imageFile: null,
                            imageName: uploadedUrl,
                          },
                        },
                      }));
                    },
                    "vision image"
                  );
                }}
                onDescriptionChange={(doc) => {
                  setState((prev) => ({
                    ...prev,
                    missionVision: {
                      ...prev.missionVision,
                      vision: {
                        ...prev.missionVision.vision,
                        description: doc,
                      },
                    },
                  }));
                }}
              />
            </div>
          )}

          {activeTab === "values" && (
            <div className="about-content about-stack-gap">
              <div className="about-two-col">
                <input
                  type="text"
                  className="about-input"
                  placeholder="Title"
                  value={state.values.title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setState((prev) => ({
                      ...prev,
                      values: {
                        ...prev.values,
                        title: value,
                      },
                    }));
                  }}
                />

                <textarea
                  className="about-textarea about-textarea-short"
                  placeholder="Subtitle"
                  value={state.values.subtitle}
                  onChange={(event) => {
                    const value = event.target.value;
                    setState((prev) => ({
                      ...prev,
                      values: {
                        ...prev.values,
                        subtitle: value,
                      },
                    }));
                  }}
                />
              </div>

              {state.values.items.map((item, index) => (
                <section key={`value-item-${index}`} className="about-value-item">
                  <h4>#{index + 1}</h4>

                  <div className="about-three-col">
                    <input
                      type="text"
                      className="about-input"
                      placeholder="Title"
                      value={item.title}
                      onChange={(event) => updateValueItem(index, "title", event.target.value)}
                    />

                    <UploadField
                      id={`value-icon-${index}`}
                      placeholder="Icon"
                      value={item.iconName}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        handleAssetUpload(
                          file,
                          (uploadedUrl) => {
                            updateValueItem(index, "iconFile", null);
                            updateValueItem(index, "iconName", uploadedUrl);
                          },
                          `value #${index + 1} icon`
                        );
                      }}
                    />

                    <textarea
                      className="about-textarea about-textarea-short"
                      placeholder="Description"
                      value={item.description}
                      onChange={(event) => updateValueItem(index, "description", event.target.value)}
                    />
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
