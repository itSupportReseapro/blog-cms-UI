export default function ToolbarButton({
  onClick,
  children,
  title,
  disabled,
  onBefore,
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (typeof onBefore === "function") onBefore();
        onClick();
      }}
      className="re-btn"
    >
      {children}
    </button>
  );
}
