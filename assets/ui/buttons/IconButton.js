export default function IconButton({ icon, label, ...props }) {
  return (
    <button
      aria-label={label}
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        border: "1px solid #d1d5db",
        borderRadius: 6,
        background: "#fff",
      }}
    >
      {icon}
    </button>
  );
}
