interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: "ac" | "green";
}

export default function StatCard({ label, value, sub, colorClass }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value${colorClass ? ` ${colorClass}` : ""}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
