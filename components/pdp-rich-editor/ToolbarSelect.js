export default function ToolbarSelect({
  value,
  onChange,
  options,
  title,
  onBeforeOpen,
}) {
  return (
    <select
      aria-label={title}
      value={value}
      onMouseDownCapture={() => {
        if (typeof onBeforeOpen === "function") onBeforeOpen();
      }}
      onChange={(e) => onChange(e.target.value)}
      className="re-select"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
