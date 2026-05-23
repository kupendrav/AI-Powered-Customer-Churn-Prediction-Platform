"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props { high: number; medium: number; low: number; }

export default function RiskPieChart({ high, medium, low }: Props) {
  const data = [
    { name: "High Risk", value: high, color: "#ef4444" },
    { name: "Medium Risk", value: medium, color: "#f59e0b" },
    { name: "Low Risk", value: low, color: "#10b981" },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
