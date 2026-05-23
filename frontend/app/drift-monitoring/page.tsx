"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getDriftReports, runDriftCheck, getModelMetrics } from "@/services/api";

const MOCK_FEATURES = [
  { feature: "monthly_charges", drift_score: 0.03, drifted: false },
  { feature: "tenure_months", drift_score: 0.12, drifted: true },
  { feature: "support_tickets", drift_score: 0.05, drifted: false },
  { feature: "login_frequency", drift_score: 0.08, drifted: false },
  { feature: "customer_satisfaction", drift_score: 0.04, drifted: false },
  { feature: "nps_score", drift_score: 0.15, drifted: true },
];

export default function DriftMonitoringPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    getDriftReports().then(setReports).catch(() => {});
    getModelMetrics().then(setMetrics).catch(() => {});
  }, []);

  const handleRunDrift = async () => {
    setRunning(true);
    try {
      const r = await runDriftCheck();
      toast.success(`Drift check complete. Drift detected: ${r.drift_detected ? "Yes" : "No"}`);
      getDriftReports().then(setReports).catch(() => {});
    } catch {
      toast.error("Drift check failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Drift Monitoring</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
                Data and concept drift detection powered by Evidently AI
              </p>
            </div>
            <button onClick={handleRunDrift} disabled={running} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1.25rem", borderRadius: 8,
              background: "var(--brand-dim)", color: "var(--brand-light)",
              border: "1px solid rgba(79,110,247,0.3)", cursor: running ? "not-allowed" : "pointer",
              fontWeight: 500, fontSize: "0.875rem", fontFamily: "var(--font-sans)",
            }}>
              <RefreshCw size={14} style={{ animation: running ? "spin 1s linear infinite" : "none" }} />
              {running ? "Running…" : "Run Drift Check"}
            </button>
          </div>

          {/* Model metrics */}
          {metrics && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Current Model Metrics — v{metrics.model_version ?? "N/A"}
              </div>
              {metrics.model_version === "not_trained" ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {metrics.note}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                  {["accuracy", "roc_auc", "f1", "precision", "recall"].map((m) => (
                    <div key={m}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{m}</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--brand-light)" }}>
                        {metrics[m] != null ? (metrics[m] * 100).toFixed(1) + "%" : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feature drift chart */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Feature Drift Scores (KL Divergence)
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_FEATURES} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="feature" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v.toFixed(3), "Drift Score"]}
                />
                <Bar dataKey="drift_score" radius={[4, 4, 0, 0]}>
                  {MOCK_FEATURES.map((entry, i) => (
                    <Cell key={i} fill={entry.drifted ? "#ef4444" : "#4f6ef7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", fontSize: "0.75rem" }}>
              <span style={{ color: "#4f6ef7" }}>● No drift</span>
              <span style={{ color: "#ef4444" }}>● Drift detected</span>
              <span style={{ color: "var(--text-muted)" }}>Threshold: 0.10</span>
            </div>
          </div>

          {/* Reports list */}
          <div className="card">
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Recent Drift Reports
            </div>
            {reports.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "1.5rem 0", textAlign: "center" }}>
                No reports yet. Run a drift check above.
              </div>
            ) : (
              reports.map((r, i) => (
                <motion.div key={r.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.65rem 0.75rem", borderRadius: 8, background: "var(--surface-border)",
                    marginBottom: 6,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {r.drift_detected
                      ? <AlertTriangle size={16} color="var(--risk-high)" />
                      : <CheckCircle size={16} color="var(--risk-low)" />}
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{r.report_type}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.feature_name ?? "All features"}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: r.drift_detected ? "var(--risk-high)" : "var(--risk-low)" }}>
                      {r.drift_score?.toFixed(4) ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
