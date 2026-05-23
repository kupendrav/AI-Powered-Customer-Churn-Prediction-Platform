"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, BarChart3, Brain, AlertTriangle } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Churn Prediction", desc: "Random Forest, XGBoost, LightGBM ensemble with SMOTE balancing and SHAP explanations." },
  { icon: Shield, title: "Risk Scoring", desc: "Per-customer risk scores with top contributing factors and confidence levels." },
  { icon: TrendingUp, title: "Revenue Intelligence", desc: "MRR at risk, CLV analysis, and estimated revenue saved per retention action." },
  { icon: Zap, title: "Smart Recommendations", desc: "AI-generated retention strategies ranked by impact and estimated ROI." },
  { icon: BarChart3, title: "EDA Dashboards", desc: "Interactive charts: churn by segment, cohort analysis, correlation heatmaps." },
  { icon: AlertTriangle, title: "Drift Monitoring", desc: "Evidently-powered data and concept drift detection with Grafana alerts." },
];

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-bg)" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", borderBottom: "1px solid #fff",
        position: "sticky", top: 0, background: "rgba(11,15,26,0.85)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>
          Churn<span style={{ color: "#fff" }}>AI</span>
        </span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/login" style={{
            padding: "0.45rem 1.2rem", borderRadius: 8, border: "1px solid #fff",
            color: "#fff", textDecoration: "none", fontSize: "0.875rem",
          }}>Sign in</Link>
          <Link href="/register" style={{
            padding: "0.45rem 1.2rem", borderRadius: 8,
            background: "var(--brand)", color: "#fff",
            textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 999,
            background: "var(--brand-dim)", color: "var(--brand-light)",
            fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.06em",
            marginBottom: "1.5rem", border: "1px solid rgba(79,110,247,0.3)",
          }}>
            ENTERPRISE AI PLATFORM
          </span>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700,
            lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 1.5rem",
          }}>
            Predict churn before<br />
            <span style={{ color: "var(--brand-light)" }}>customers leave</span>
          </h1>
          <p style={{
            fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: 540,
            margin: "0 auto 2.5rem", lineHeight: 1.7,
          }}>
            ML-powered retention intelligence with explainable AI, real-time risk scoring,
            and automated retention recommendations.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{
              padding: "0.75rem 2rem", borderRadius: 10,
              background: "var(--brand)", color: "#fff",
              textDecoration: "none", fontWeight: 500, fontSize: "1rem",
            }}>
              View Dashboard →
            </Link>
            <Link href="/login" style={{
              padding: "0.75rem 2rem", borderRadius: 10,
              border: "1px solid var(--surface-border)",
              color: "var(--text-secondary)", textDecoration: "none", fontSize: "1rem",
            }}>
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section style={{
        display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap",
        padding: "2rem", borderTop: "1px solid var(--surface-border)",
        borderBottom: "1px solid var(--surface-border)",
      }}>
        {[["100k+", "Synthetic records"], ["4", "ML models"], ["SHAP", "Explainability"], ["Real-time", "Drift alerts"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--brand-light)" }}>{val}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.75rem", fontWeight: 600, marginBottom: "3rem" }}>
          Everything you need to retain customers
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -4 }}
              style={{
                background: "var(--surface-card)", border: "1px solid var(--surface-border)",
                borderRadius: 12, padding: "1.5rem",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--brand-dim)", display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "1rem",
              }}>
                <Icon size={20} color="var(--brand-light)" />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "2rem",
        borderTop: "1px solid var(--surface-border)",
        color: "var(--text-muted)", fontSize: "0.8rem",
      }}>
        ChurnAI Platform © 2025 · MIT License
      </footer>
    </main>
  );
}
