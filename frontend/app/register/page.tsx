"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { signUpWithPassword, verifyEmailCode } from "@/app/actions/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", full_name: "", password: "", confirm: "" });
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const result = await signUpWithPassword(form.email, form.password, form.full_name);
      if (result.error) throw new Error(result.error);
      if (result.requireEmailVerification) {
        setVerificationEmail(form.email);
        toast.success("Check your email for the verification code.");
        return;
      }
      toast.success("Account created!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyEmailCode(verificationEmail, otp);
      if (result.error) throw new Error(result.error);
      toast.success("Email verified. Welcome!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.875rem", background: "var(--surface-border)",
    border: "1px solid var(--surface-border)", borderRadius: 8,
    color: "var(--text-primary)", fontSize: "0.9rem", outline: "none", fontFamily: "var(--font-sans)",
  };
  const lbl: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)",
    letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-bg)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--brand-light)", marginBottom: 8 }}>
            Churn<span style={{ color: "var(--text-primary)" }}>AI</span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Create an account</h1>
        </div>
        <div className="card">
          {verificationEmail ? (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={lbl}>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={inp}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: "0.75rem", borderRadius: 8,
              background: loading ? "var(--surface-border)" : "var(--brand)",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500, fontSize: "0.9rem", fontFamily: "var(--font-sans)",
            }}>
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {(["full_name", "email", "password", "confirm"] as const).map((field) => (
              <div key={field}>
                <label style={lbl}>{field === "full_name" ? "Full Name" : field === "confirm" ? "Confirm Password" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field.includes("password") || field === "confirm" ? "password" : field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  style={inp} required
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              padding: "0.75rem", borderRadius: 8,
              background: loading ? "var(--surface-border)" : "var(--brand)",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500, fontSize: "0.9rem", fontFamily: "var(--font-sans)",
            }}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          )}
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--brand-light)" }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
