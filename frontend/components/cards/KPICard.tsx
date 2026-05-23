"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  index?: number;
}

export default function KPICard({ title, value, delta, deltaUp, icon: Icon, iconColor = "var(--brand)", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {title}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "rgba(79,110,247,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={iconColor} />
        </div>
      </div>

      <div className="kpi-value">{value}</div>

      {delta && (
        <div style={{ fontSize: "0.78rem", color: deltaUp ? "var(--risk-low)" : "var(--risk-high)" }}>
          {deltaUp ? "▲" : "▼"} {delta}
        </div>
      )}
    </motion.div>
  );
}
