import BaseCard from "./BaseCard";

export default function StatsCard({ title, value }) {
  return (
    <BaseCard>
      <p style={{ margin: 0, color: "#6b7280" }}>{title}</p>
      <h3 style={{ margin: "8px 0 0" }}>{value}</h3>
    </BaseCard>
  );
}
