"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getHighRiskRecommendations, generateRecommendations } from "@/services/api";

interface Rec {
  id: string; customer_id: string; strategy: string; rationale: string;
  priority: string; estimated_revenue_saved: number; estimated_churn_reduction: number;
  action_items: string[];
}

const priorityColor = (p: string) =>
  p === "high" ? "var(--risk-high)" : p === "medium" ? "var(--risk-medium)" : "var(--risk-low)";

export default function InsightsPage() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (customerId) return;
    if (typeof window === "undefined") return;
    const preset = new URLSearchParams(window.location.search).get("customer_id");
    if (preset) setCustomerId(preset);
  }, [customerId]);

  useEffect(() => {
    getHighRiskRecommendations(30).then(setRecs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!customerId.trim()) { toast.error("Enter a customer ID"); return; }
    setGenLoading(true);
    try {
      const newRecs = await generateRecommendations(customerId.trim());
      setRecs((p) => [...newRecs, ...p]);
      toast.success(`Generated ${newRecs.length} recommendations`);
    } catch {
      toast.error("Customer not found or no prediction available");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 1000 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>AI Retention Insights</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
              Actionable retention strategies for high-risk customers
            </p>
          </div>

          {/* Generate for specific customer */}
          <div className="card" style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Generate recommendations for customer ID</label>
              <input
                value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. CUST0000001"
                style={{
                  width: "100%", padding: "0.6rem 0.875rem", background: "var(--surface-border)",
                  border: "1px solid var(--surface-border)", borderRadius: 8,
                  color: "var(--text-primary)", fontSize: "0.875rem", outline: "none",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <button onClick={handleGenerate} disabled={genLoading} style={{
              padding: "0.6rem 1.25rem", borderRadius: 8, background: "var(--brand)",
              color: "#fff", border: "none", cursor: genLoading ? "not-allowed" : "pointer",
              fontWeight: 500, whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
            }}>
              {genLoading ? "Generating…" : "Generate"}
            </button>
          </div>

          {loading && <div style={{ color: "var(--text-muted)" }}>Loading recommendations…</div>}

          {!loading && recs.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
              No recommendations yet. Generate some from the prediction page or by entering a customer ID above.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recs.map((rec, i) => (
              <motion.div
                key={rec.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                      {rec.customer_id}
                    </div>
                    <h3 style={{ margin: 0, fontSize: "0.975rem", fontWeight: 600 }}>{rec.strategy}</h3>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <span className={`badge badge-${rec.priority}`}>{rec.priority} priority</span>
                  </div>
                </div>

                <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {rec.rationale}
                </p>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Est. Revenue Saved</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--risk-low)" }}>
                      ${rec.estimated_revenue_saved?.toFixed(0) ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Churn Reduction</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--brand-light)" }}>
                      {rec.estimated_churn_reduction ? `${(rec.estimated_churn_reduction * 100).toFixed(0)}%` : "—"}
                    </div>
                  </div>
                </div>

                {rec.action_items?.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Action Items
                    </div>
                    {rec.action_items.map((a, j) => (
                      <div key={j} style={{
                        display: "flex", alignItems: "flex-start", gap: "0.5rem",
                        fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 6,
                      }}>
                        <span style={{ color: "var(--brand)", marginTop: 2 }}>→</span>
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
