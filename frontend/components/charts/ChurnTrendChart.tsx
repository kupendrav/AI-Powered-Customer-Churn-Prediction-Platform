"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props { data: { month: string; churn_rate: number }[]; }

const MOCK = [
  { month: "Jul", churn_rate: 5.2 }, { month: "Aug", churn_rate: 4.8 },
  { month: "Sep", churn_rate: 5.6 }, { month: "Oct", churn_rate: 6.1 },
  { month: "Nov", churn_rate: 5.9 }, { month: "Dec", churn_rate: 5.4 },
  { month: "Jan", churn_rate: 4.9 },
];

export default function ChurnTrendChart({ data }: Props) {
  const d = data?.length ? data : MOCK;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--text-secondary)" }}
          itemStyle={{ color: "var(--brand-light)" }}
          formatter={(v: number) => [`${v}%`, "Churn Rate"]}
        />
        <Line type="monotone" dataKey="churn_rate" stroke="var(--brand)" strokeWidth={2} dot={{ r: 3, fill: "var(--brand)" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
