"use client";
import RiskBadge from "@/components/ui/RiskBadge";

interface Customer {
  customer_id: string;
  region?: string;
  contract_type?: string;
  monthly_charges?: number;
  tenure_months?: number;
  risk_score?: number;
  churn_label?: boolean;
}

interface Props { customers: Customer[]; onSelect?: (c: Customer) => void; }

function riskLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export default function CustomerRiskTable({ customers, onSelect }: Props) {
  if (!customers?.length)
    return <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center", fontSize: "0.875rem" }}>No customers found.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Region</th>
            <th>Contract</th>
            <th>Tenure (mo)</th>
            <th>Monthly $</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Churned</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.customer_id} onClick={() => onSelect?.(c)}>
              <td style={{ color: "var(--brand-light)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{c.customer_id}</td>
              <td>{c.region ?? "—"}</td>
              <td>{c.contract_type ?? "—"}</td>
              <td>{c.tenure_months ?? "—"}</td>
              <td>${c.monthly_charges?.toFixed(2) ?? "—"}</td>
              <td style={{ fontFamily: "var(--font-mono)" }}>{((c.risk_score ?? 0) * 100).toFixed(1)}%</td>
              <td><RiskBadge level={riskLevel(c.risk_score ?? 0)} /></td>
              <td style={{ color: c.churn_label ? "var(--risk-high)" : "var(--risk-low)" }}>
                {c.churn_label ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
