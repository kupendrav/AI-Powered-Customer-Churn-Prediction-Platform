"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  LineChart,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Churn Prediction", desc: "Model-backed churn probability with clear risk categories for every customer." },
  { icon: Shield, title: "Explainable Risk", desc: "Business-readable factors show why an account is likely to leave." },
  { icon: TrendingUp, title: "Revenue Intelligence", desc: "Track churn rate, MRR at risk, CLV, NPS, and retention impact." },
  { icon: Zap, title: "Retention Actions", desc: "Generate next-best actions for customer success and revenue teams." },
  { icon: BarChart3, title: "Segment Analytics", desc: "Compare churn across regions, plans, contracts, and payment methods." },
  { icon: AlertTriangle, title: "Model Monitoring", desc: "Monitor metrics and drift so AI quality stays visible over time." },
];

const stats = [
  ["110k", "customer records loaded"],
  ["0.816", "ROC AUC baseline"],
  ["8/8", "backend tests passing"],
  ["Docker", "full stack runtime"],
];

const workflow = [
  "Upload customer behavior data",
  "Score churn probability",
  "Explain risk drivers",
  "Recommend retention actions",
];

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef3ff 52%, #f8fafc 100%)" }}>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.85rem clamp(1rem, 4vw, 2.5rem)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.12)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.85) inset, 0 8px 24px rgba(15,23,42,0.06)",
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
          <span style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--brand)",
            color: "#fff",
            border: "1px solid rgba(15,23,42,0.12)",
            boxShadow: "0 8px 18px rgba(47,91,255,0.24)",
          }}>
            <LineChart size={18} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>ChurnAI</strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Retention Intelligence</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link href="/login" style={{
            padding: "0.55rem 1rem",
            borderRadius: 8,
            border: "1px solid rgba(15,23,42,0.16)",
            background: "#fff",
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>Sign in</Link>
          <Link href="/dashboard" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.55rem 1rem",
            borderRadius: 8,
            border: "1px solid rgba(47,91,255,0.35)",
            background: "var(--brand)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            boxShadow: "0 10px 24px rgba(47,91,255,0.22)",
          }}>
            Dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(3rem, 7vw, 5.5rem) clamp(1rem, 4vw, 2rem) 3rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "2rem",
        alignItems: "center",
      }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 0.75rem",
            borderRadius: 8,
            background: "#fff",
            color: "var(--brand)",
            fontSize: "0.78rem",
            fontWeight: 700,
            border: "1px solid rgba(47,91,255,0.22)",
            boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
            marginBottom: "1.2rem",
          }}>
            <CheckCircle2 size={15} /> ENTERPRISE AI RETENTION PLATFORM
          </span>

          <h1 style={{
            fontSize: "clamp(2.45rem, 6vw, 4.6rem)",
            fontWeight: 800,
            lineHeight: 1.02,
            margin: "0 0 1.25rem",
            color: "#0f172a",
          }}>
            Predict churn before customers leave.
          </h1>

          <p style={{
            fontSize: "1.08rem",
            color: "var(--text-secondary)",
            maxWidth: 610,
            margin: "0 0 1.8rem",
            lineHeight: 1.75,
          }}>
            ChurnAI turns customer behavior into revenue intelligence: risk scores, model metrics,
            explainable drivers, and retention recommendations in one operational dashboard.
          </p>

          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.8rem 1.25rem",
              borderRadius: 8,
              border: "1px solid rgba(47,91,255,0.35)",
              background: "var(--brand)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 14px 30px rgba(47,91,255,0.25)",
            }}>
              View dashboard <ArrowRight size={17} />
            </Link>
            <Link href="/login" style={{
              padding: "0.8rem 1.25rem",
              borderRadius: 8,
              border: "1px solid rgba(15,23,42,0.16)",
              background: "#fff",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 700,
            }}>
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            background: "#fff",
            border: "1px solid rgba(15,23,42,0.14)",
            borderRadius: 8,
            boxShadow: "0 22px 60px rgba(15,23,42,0.12)",
            overflow: "hidden",
          }}
        >
          <div style={{
            padding: "0.85rem 1rem",
            borderBottom: "1px solid rgba(15,23,42,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}>
            <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>Revenue Risk Snapshot</strong>
            <span style={{ color: "#047857", fontSize: "0.78rem", fontWeight: 700 }}>Live model</span>
          </div>

          <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {stats.map(([value, label]) => (
              <div key={label} style={{
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 8,
                padding: "1rem",
                background: "#fff",
              }}>
                <div style={{ color: "var(--brand)", fontSize: "1.55rem", fontWeight: 800, lineHeight: 1 }}>{value}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.45rem" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 1rem 1rem" }}>
            <div style={{
              border: "1px solid rgba(15,23,42,0.12)",
              borderRadius: 8,
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(47,91,255,0.08), rgba(16,185,129,0.08))",
            }}>
              {workflow.map((item, index) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0" }}>
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid rgba(47,91,255,0.2)",
                    color: "var(--brand)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}>{index + 1}</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.92rem", fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 clamp(1rem, 4vw, 2rem) 4rem",
      }}>
        <div style={{
          border: "1px solid rgba(15,23,42,0.12)",
          borderRadius: 8,
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
          padding: "1rem",
        }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.3rem", color: "#0f172a" }}>
            Everything needed to retain customers
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "0.9rem",
          }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -3 }}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.12)",
                  borderRadius: 8,
                  padding: "1rem",
                  minHeight: 158,
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "var(--brand-dim)",
                  border: "1px solid rgba(47,91,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.9rem",
                }}>
                  <Icon size={19} color="var(--brand)" />
                </div>
                <h3 style={{ margin: "0 0 0.45rem", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
