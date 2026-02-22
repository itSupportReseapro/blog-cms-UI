export default function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "#fff",
        color: "#111827",
        border: "1px solid #d1d5db",
        borderRadius: 6,
        padding: "10px 14px",
      }}
    >
      {children}
    </button>
  );
}
