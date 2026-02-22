export default function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "#111827",
        color: "#fff",
        border: 0,
        borderRadius: 6,
        padding: "10px 14px",
      }}
    >
      {children}
    </button>
  );
}
