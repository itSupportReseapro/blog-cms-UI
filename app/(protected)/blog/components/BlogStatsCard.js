export default function BlogStatsCard({ title, value }) {
  return (
    <article style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <p style={{ margin: 0, color: "#6b7280" }}>{title}</p>
      <h3 style={{ margin: "8px 0 0" }}>{value}</h3>
    </article>
  );
}
