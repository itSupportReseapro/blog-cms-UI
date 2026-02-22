export default function BaseModal({ title, children, onClose }) {
  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 10, padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button type="button" onClick={onClose}>
          X
        </button>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
