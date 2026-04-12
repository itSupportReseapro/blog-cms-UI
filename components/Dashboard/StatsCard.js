import "./StatsCard.css";

export default function StatsCard({ title, value, icon }) {
  return (
    <article className="stats-card">
      {icon && <div className="stats-card-icon">{icon}</div>}
      <div className="stats-card-content">
        <p className="stats-card-title">{title}</p>
        <h3 className="stats-card-value">{value}</h3>
      </div>
    </article>
  );
}
