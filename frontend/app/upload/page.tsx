"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { uploadChurnData } from "@/services/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; total_rows: number; filename: string } | null>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) setFile(f);
    else toast.error("Only CSV files accepted");
  }, []);

  const handleUpload = async () => {
    if (!file) { toast.error("Select a file first"); return; }
    setLoading(true);
    try {
      const r = await uploadChurnData(file);
      setResult(r);
      toast.success(`Inserted ${r.inserted} new customers`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Upload Data</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
              Import customer churn data for analysis and model training
            </p>
          </div>

          {/* Drop zone */}
          <div
            className="card"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            style={{
              border: `2px dashed ${drag ? "var(--brand)" : "var(--surface-border)"}`,
              borderRadius: 12, textAlign: "center", padding: "3rem",
              background: drag ? "var(--brand-dim)" : "var(--surface-card)",
              transition: "all 0.2s", marginBottom: "1.5rem",
            }}
          >
            <Upload size={40} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
            <div style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Drop your CSV here, or{" "}
              <label style={{ color: "var(--brand-light)", cursor: "pointer" }}>
                browse
                <input type="file" accept=".csv" style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Required columns: customer_id, monthly_charges, churn_label
            </div>
          </div>

          {/* Selected file */}
          {file && (
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <FileText size={24} color="var(--brand-light)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{file.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button onClick={() => setFile(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
            </motion.div>
          )}

          <button onClick={handleUpload} disabled={loading || !file} style={{
            width: "100%", padding: "0.75rem", borderRadius: 8,
            background: !file ? "var(--surface-border)" : "var(--brand)",
            color: !file ? "var(--text-muted)" : "#fff",
            border: "none", cursor: !file ? "not-allowed" : "pointer",
            fontWeight: 500, fontSize: "0.9rem", fontFamily: "var(--font-sans)",
          }}>
            {loading ? "Uploading…" : "Upload & Import"}
          </button>

          {/* Success */}
          {result && (
            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <CheckCircle size={28} color="var(--risk-low)" />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload successful</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {result.inserted} new customers inserted from {result.total_rows} total rows in <em>{result.filename}</em>
                </div>
              </div>
            </motion.div>
          )}

          {/* Expected format */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Expected CSV Format
            </div>
            <div style={{ overflowX: "auto" }}>
              <pre style={{
                fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                color: "var(--text-secondary)", margin: 0, lineHeight: 1.7,
              }}>
{`customer_id,age,gender,region,contract_type,subscription_type,
tenure_months,monthly_charges,total_spending,payment_method,
login_frequency,support_tickets,customer_satisfaction,
nps_score,churn_label

CUST0000001,35,Male,North,Month-to-month,Basic,
4,65.50,262.00,Electronic check,
1.5,5,2.1,-20,1`}
              </pre>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
