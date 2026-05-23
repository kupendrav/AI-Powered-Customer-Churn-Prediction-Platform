"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props { data: { segment: string; churn_rate: number; count: number }[]; }

const COLORS = ["#ef4444", "#f59e0b", "#4f6ef7", "#10b981", "#8b5cf6"];

export default function SegmentChart({ data }: Props) {
  if (!data?.length) return <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "2rem", textAlign: "center" }}>No data</div>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
        <XAxis dataKey="segment" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [`${v}%`, "Churn Rate"]}
        />
        <Bar dataKey="churn_rate" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
