"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./api-dropdown-field.css";

export default function ApiDropdownField({
  label,
  value,
  placeholder = "Select",
  options = [],
  loading = false,
  disabled = false,
  addFields = [],
  onOpen,
  onSelect,
  onAdd,
}) {
  const rootRef = useRef(null);
  const onOpenRef = useRef(onOpen);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addForm, setAddForm] = useState({});

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setAddForm({});
      return;
    }

    onOpenRef.current?.();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const isCountryDropdown = String(label || "").trim().toLowerCase() === "country";

  const canShowAdd = typeof onAdd === "function";

  const canAdd =
    canShowAdd &&
    (addFields.length > 0
      ? addFields.every((field) => String(addForm[field.name] || "").trim())
      : Boolean(query.trim()) &&
        !options.some(
          (option) => option.label.toLowerCase() === query.trim().toLowerCase()
        ));

  const handleAdd = () => {
    if (!canShowAdd) {
      return;
    }

    if (addFields.length > 0) {
      const payload = addFields.reduce((acc, field) => {
        acc[field.name] = String(addForm[field.name] || "").trim();
        return acc;
      }, {});

      onAdd?.(payload);
      return;
    }

    onAdd?.(query.trim());
  };

  return (
    <div className="api-dropdown-field" ref={rootRef}>
      <button
        type="button"
        className={`api-dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span className="api-dropdown-label">{label}</span>
        <span className={`api-dropdown-value ${value ? "filled" : ""}`}>
          {value || placeholder}
        </span>
        <span className="api-dropdown-caret" />
      </button>

      {isOpen && !disabled && (
        <div className="api-dropdown-panel">
          {canShowAdd && (
            <div className="api-dropdown-input-row">
              {addFields.length > 0 ? (
                addFields.map((field) => (
                  <input
                    key={field.name}
                    type="text"
                    value={addForm[field.name] || ""}
                    placeholder={field.placeholder || field.label}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                  />
                ))
              ) : (
                <input
                  type="text"
                  value={query}
                  placeholder="Enter to add"
                  onChange={(e) => setQuery(e.target.value)}
                />
              )}
              <button
                type="button"
                className="api-dropdown-add-btn"
                onClick={handleAdd}
                disabled={!canAdd}
              >
                Add
              </button>
            </div>
          )}

          <div className={`api-dropdown-list ${isCountryDropdown ? "light-scrollbar" : ""}`}>
            {loading && <div className="api-dropdown-empty">Loading...</div>}

            {!loading && visibleOptions.length === 0 && (
              <div className="api-dropdown-empty">No values found</div>
            )}

            {!loading &&
              visibleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="api-dropdown-item"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
