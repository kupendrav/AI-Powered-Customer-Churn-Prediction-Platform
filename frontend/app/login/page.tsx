"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function LoginForm() {
  const [email, setEmail] = useState("admin@churn.ai");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.875rem",
    background: "var(--surface-border)", border: "1px solid var(--surface-border)",
    borderRadius: 8, color: "var(--text-primary)", fontSize: "0.9rem",
    outline: "none", fontFamily: "var(--font-sans)",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)",
    letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--surface-bg)",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: 380 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--brand-light)", marginBottom: 8 }}>
            Churn<span style={{ color: "var(--text-primary)" }}>AI</span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Sign in to your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 6 }}>
            Default: admin@churn.ai / admin123
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={inputStyle} required
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} required
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{
                padding: "0.75rem", borderRadius: 8, background: loading ? "var(--surface-border)" : "var(--brand)",
                color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 500, fontSize: "0.9rem", fontFamily: "var(--font-sans)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>;
}
