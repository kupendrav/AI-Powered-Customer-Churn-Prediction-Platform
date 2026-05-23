"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, TrendingUp, Upload,
  Lightbulb, Activity, Settings, LogOut, Zap,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/predictions", icon: Zap, label: "Predictions" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/upload", icon: Upload, label: "Upload Data" },
  { href: "/drift-monitoring", icon: Activity, label: "Drift Monitor" },
  { href: "/admin", icon: Users, label: "Admin" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface Props { onLogout?: () => void; userName?: string; userRole?: string; }

export default function Sidebar({ onLogout, userName = "User", userRole = "analyst" }: Props) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "var(--surface-card)",
      borderRight: "1px solid var(--surface-border)",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--surface-border)" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-light)" }}>
          Churn<span style={{ color: "var(--text-primary)" }}>AI</span>
        </span>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>Retention Intelligence</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.55rem 0.75rem", borderRadius: 8, textDecoration: "none",
              fontSize: "0.875rem", fontWeight: active ? 500 : 400,
              color: active ? "var(--brand-light)" : "var(--text-secondary)",
              background: active ? "var(--brand-dim)" : "transparent",
              borderLeft: active ? "2px solid var(--brand)" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: "1rem", borderTop: "1px solid var(--surface-border)",
        display: "flex", alignItems: "center", gap: "0.625rem",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--brand-dim)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-light)",
          flexShrink: 0,
        }}>
          {userName[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{userRole}</div>
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
