import { useEffect, useMemo, useRef, useState } from "react";
import { DropdownIcon } from "../icons";

export default function ToolbarSelect({
  value,
  onChange,
  options,
  title,
  onBeforeOpen,
  renderValue,
  renderOption,
  menuClassName,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) || options[0] || null,
    [options, value]
  );

  useEffect(() => {
    const onDocPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocPointerDown);
    return () => document.removeEventListener("mousedown", onDocPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="re-select-wrap">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="re-select"
        onMouseDown={(event) => {
          event.preventDefault();
          if (typeof onBeforeOpen === "function") onBeforeOpen();
          setOpen((prev) => !prev);
        }}
      >
        <span className="re-select__value">
          {renderValue ? renderValue(selected) : selected?.label || title}
        </span>
        <span className="re-select__chevron"><DropdownIcon /></span>
      </button>

      {open ? (
        <div
          className={["re-select__menu", menuClassName].filter(Boolean).join(" ")}
          role="listbox"
          aria-label={title}
          onMouseDown={(event) => event.preventDefault()}
        >
          {options ? options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={["re-select__option", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {renderOption ? renderOption(option, isSelected) : option.label}
              </button>
            );
          }) : null}
        </div>
      ) : null}
    </div>
  );
}
