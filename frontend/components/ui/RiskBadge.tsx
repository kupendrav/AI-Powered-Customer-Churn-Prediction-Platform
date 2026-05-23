interface Props { level: "high" | "medium" | "low"; }

export default function RiskBadge({ level }: Props) {
  return <span className={`badge badge-${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>;
}
