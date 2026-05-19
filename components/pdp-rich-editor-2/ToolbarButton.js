export default function ToolbarButton({
  onClick,
  children,
  title,
  disabled,
  onBefore,
  active = false,
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (disabled) return;
        if (typeof onBefore === "function") onBefore();
        if (typeof onClick === "function") onClick();
      }}
      className={["re-btn", active ? "re-btn--active" : ""].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
