"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, TrendingDown, AlertTriangle, DollarSign, Star, BarChart3,
} from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/cards/KPICard";
import ChurnTrendChart from "@/components/charts/ChurnTrendChart";
import SegmentChart from "@/components/charts/SegmentChart";
import RiskPieChart from "@/components/charts/RiskPieChart";
import CustomerRiskTable from "@/components/tables/CustomerRiskTable";
import { getKPIs, getChurnBySegment, getCustomers } from "@/services/api";

interface KPI {
  total_customers: number; churn_rate: number; at_risk_customers: number;
  mrr_at_risk: number; avg_clv: number; avg_nps: number;
  monthly_churn_trend: { month: string; churn_rate: number }[];
  risk_high: number; risk_medium: number; risk_low: number;
}

function fmt(n: number, prefix = "") { return `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: 1 })}`; }

export default function DashboardPage() {
  const router = useRouter();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [segments, setSegments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getKPIs().catch(() => null),
      getChurnBySegment("contract_type").catch(() => []),
      getCustomers(0, 10, 0.6).catch(() => ({ customers: [] })),
    ]).then(([k, s, c]) => {
      setKpi(k);
      setSegments(s || []);
      setCustomers(c?.customers || []);
    }).finally(() => setLoading(false));
  }, []);

  const KPIS = [
    { title: "Total Customers", value: kpi ? fmt(kpi.total_customers) : "—", icon: Users },
    { title: "Churn Rate", value: kpi ? `${kpi.churn_rate}%` : "—", icon: TrendingDown, iconColor: "var(--risk-high)" },
    { title: "At-Risk Customers", value: kpi ? fmt(kpi.at_risk_customers) : "—", icon: AlertTriangle, iconColor: "var(--risk-medium)" },
    { title: "MRR at Risk", value: kpi ? `$${fmt(kpi.mrr_at_risk)}` : "—", icon: DollarSign, iconColor: "var(--risk-high)" },
    { title: "Avg CLV", value: kpi ? `$${fmt(kpi.avg_clv)}` : "—", icon: BarChart3, iconColor: "var(--risk-low)" },
    { title: "Avg NPS", value: kpi ? fmt(kpi.avg_nps) : "—", icon: Star, iconColor: "#f59e0b" },
  ];

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 1200 }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Dashboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
              Real-time churn intelligence overview
            </p>
          </div>

          {loading && (
            <div style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Loading data…</div>
          )}

          {/* KPI Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: "1rem", marginBottom: "1.75rem",
          }}>
            {KPIS.map((k, i) => <KPICard key={k.title} {...k} index={i} />)}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.75rem" }}>
            <div className="card" style={{ gridColumn: "span 1" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Churn Rate Trend
              </div>
              <ChurnTrendChart data={kpi?.monthly_churn_trend ?? []} />
            </div>

            <div className="card">
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Churn by Contract Type
              </div>
              <SegmentChart data={segments} />
            </div>

            <div className="card">
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Risk Distribution
              </div>
              <RiskPieChart
                high={kpi?.risk_high ?? 0}
                medium={kpi?.risk_medium ?? 0}
                low={kpi?.risk_low ?? 0}
              />
            </div>
          </div>

          {/* Top at-risk customers */}
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Top At-Risk Customers
            </div>
            <CustomerRiskTable
              customers={customers}
              onSelect={(c) => router.push(`/insights?customer_id=${encodeURIComponent(c.customer_id)}`)}
            />
          </motion.div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
