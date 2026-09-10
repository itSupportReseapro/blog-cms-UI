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
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (typeof onBefore === "function") onBefore();
        onClick();
      }}
      className={["re-btn", active ? "re-btn--active" : ""].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
