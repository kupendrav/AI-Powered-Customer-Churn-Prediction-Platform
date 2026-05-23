"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RiskBadge from "@/components/ui/RiskBadge";
import { predictSingle, predictBatch } from "@/services/api";

interface Result {
  customer_id: string; churn_probability: number;
  risk_category: string; top_risk_factors: { factor: string; impact: string }[];
}

const DEFAULT_FORM = {
  customer_id: "CUST0000001", age: 35, gender: "Male", region: "North",
  contract_type: "Month-to-month", subscription_type: "Basic",
  tenure_months: 4, monthly_charges: 65, total_spending: 260,
  payment_method: "Electronic check", login_frequency: 1.5,
  feature_usage_count: 2, session_time_avg: 10,
  last_login_days: 45, support_tickets: 5, complaint_count: 3,
  customer_satisfaction: 2.1, nps_score: -20,
};

function inp(style?: React.CSSProperties): React.CSSProperties {
  return {
    padding: "0.55rem 0.75rem", background: "var(--surface-border)",
    border: "1px solid var(--surface-border)", borderRadius: 8,
    color: "var(--text-primary)", fontSize: "0.85rem",
    outline: "none", fontFamily: "var(--font-sans)", width: "100%", ...style,
  };
}

export default function PredictionsPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResults, setBatchResults] = useState<Result[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const handleSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await predictSingle(form);
      setResult(r);
    } catch {
      toast.error("Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    if (!batchFile) { toast.error("Select a CSV file first"); return; }
    setBatchLoading(true);
    try {
      const r = await predictBatch(batchFile);
      setBatchResults(Array.isArray(r) ? r : []);
      toast.success(`Processed ${r.length} predictions`);
    } catch {
      toast.error("Batch prediction failed");
    } finally {
      setBatchLoading(false);
    }
  };

  const fields = Object.keys(DEFAULT_FORM) as (keyof typeof DEFAULT_FORM)[];

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 1100 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Predictions</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>Single prediction or batch CSV upload</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* Single prediction form */}
            <div className="card">
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Single Customer Prediction
              </div>
              <form onSubmit={handleSingle} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {fields.map((f) => (
                  <div key={f}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                      {f.replace(/_/g, " ")}
                    </label>
                    <input
                      value={String(form[f])}
                      onChange={(e) => setForm((p) => ({ ...p, [f]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) }))}
                      style={inp()}
                    />
                  </div>
                ))}
                <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                  <button type="submit" disabled={loading} style={{
                    width: "100%", padding: "0.7rem", borderRadius: 8,
                    background: loading ? "var(--surface-border)" : "var(--brand)",
                    color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 500, fontSize: "0.9rem", fontFamily: "var(--font-sans)",
                  }}>
                    {loading ? "Predicting…" : "Run Prediction"}
                  </button>
                </div>
              </form>
            </div>

            {/* Result panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {result && (
                <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Prediction Result
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Churn Probability</div>
                      <div style={{ fontSize: "2.5rem", fontWeight: 700, color: result.churn_probability >= 0.7 ? "var(--risk-high)" : result.churn_probability >= 0.4 ? "var(--risk-medium)" : "var(--risk-low)" }}>
                        {(result.churn_probability * 100).toFixed(1)}%
                      </div>
                    </div>
                    <RiskBadge level={result.risk_category as any} />
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Top Risk Factors
                  </div>
                  {result.top_risk_factors?.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.5rem 0.75rem", borderRadius: 6, background: "var(--surface-border)",
                      marginBottom: 6, fontSize: "0.82rem",
                    }}>
                      <span style={{ color: "var(--text-secondary)" }}>{f.factor}</span>
                      <span className={`badge badge-${f.impact}`}>{f.impact}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Batch upload */}
              <div className="card">
                <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Batch CSV Prediction
                </div>
                <input
                  type="file" accept=".csv"
                  onChange={(e) => setBatchFile(e.target.files?.[0] || null)}
                  style={{ ...inp(), marginBottom: "0.75rem" }}
                />
                <button onClick={handleBatch} disabled={batchLoading || !batchFile} style={{
                  width: "100%", padding: "0.65rem", borderRadius: 8,
                  background: !batchFile ? "var(--surface-border)" : "var(--brand-dim)",
                  color: "var(--brand-light)", border: "1px solid rgba(79,110,247,0.3)",
                  cursor: !batchFile ? "not-allowed" : "pointer", fontWeight: 500, fontSize: "0.875rem",
                  fontFamily: "var(--font-sans)",
                }}>
                  {batchLoading ? "Processing…" : "Run Batch Prediction"}
                </button>
                {batchResults.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{batchResults.length} results</div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {batchResults.slice(0, 10).map((r, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "0.4rem 0.6rem", borderRadius: 6, marginBottom: 4,
                          background: "var(--surface-border)", fontSize: "0.8rem",
                        }}>
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--brand-light)" }}>{r.customer_id}</span>
                          <span style={{ color: "var(--text-secondary)" }}>{(r.churn_probability * 100).toFixed(1)}%</span>
                          <RiskBadge level={r.risk_category as any} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
