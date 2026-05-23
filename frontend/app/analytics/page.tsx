"use client";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SegmentChart from "@/components/charts/SegmentChart";
import CustomerRiskTable from "@/components/tables/CustomerRiskTable";
import { getChurnBySegment, getCustomers } from "@/services/api";

const SEGMENTS = ["contract_type", "subscription_type", "payment_method", "region"];

export default function AnalyticsPage() {
  const [segment, setSegment] = useState("contract_type");
  const [segData, setSegData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    getChurnBySegment(segment).then(setSegData).catch(() => {});
  }, [segment]);

  useEffect(() => {
    getCustomers(page * PAGE_SIZE, PAGE_SIZE, 0).then((r) => {
      setCustomers(r.customers ?? []);
      setTotal(r.total ?? 0);
    }).catch(() => {});
  }, [page]);

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 1200 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Customer Analytics</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>Segment analysis and customer explorer</p>
          </div>

          {/* Segment selector + chart */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Churn by Segment
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {SEGMENTS.map((s) => (
                  <button key={s} onClick={() => setSegment(s)} style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer",
                    background: segment === s ? "var(--brand)" : "var(--surface-border)",
                    color: segment === s ? "#fff" : "var(--text-secondary)",
                    border: "none", fontFamily: "var(--font-sans)",
                  }}>
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <SegmentChart data={segData} />
          </div>

          {/* Customer table */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                All Customers ({total.toLocaleString()})
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: "0.78rem", cursor: page > 0 ? "pointer" : "not-allowed",
                  background: "var(--surface-border)", color: "var(--text-secondary)", border: "none",
                }}>← Prev</button>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "4px 8px" }}>Page {page + 1}</span>
                <button onClick={() => setPage((p) => p + 1)} style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer",
                  background: "var(--surface-border)", color: "var(--text-secondary)", border: "none",
                }}>Next →</button>
              </div>
            </div>
            <CustomerRiskTable customers={customers} />
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
