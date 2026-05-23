"use client";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SettingsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Settings</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>Platform configuration and preferences</p>
          </div>
          {[
            { label: "API Base URL", value: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000" },
            { label: "App Name", value: "ChurnAI" },
            { label: "Version", value: "1.0.0" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", color: "var(--brand-light)" }}>{s.value}</span>
            </div>
          ))}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Quick Links
            </div>
            {[
              ["API Docs", "/docs", "FastAPI Swagger UI"],
              ["MLflow", "http://localhost:5000", "Experiment tracking"],
              ["Grafana", "http://localhost:3001", "Monitoring dashboards"],
              ["PgAdmin", "http://localhost:5050", "Database management"],
            ].map(([label, url, desc]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.6rem 0.5rem", borderBottom: "1px solid var(--surface-border)",
                textDecoration: "none",
              }}>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--brand-light)" }}>{label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
