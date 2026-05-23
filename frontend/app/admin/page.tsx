"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { UserPlus, Trash2 } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/services/api";

interface User { id: string; email: string; full_name: string; role: string; is_active: boolean; created_at: string; }

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", full_name: "", password: "", role: "analyst" });
  const [creating, setCreating] = useState(false);

  const fetchUsers = () => api.get("/users/").then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/auth/register", form);
      toast.success("User created");
      setForm({ email: "", full_name: "", password: "", role: "analyst" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setUsers((p) => p.filter((u) => u.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.55rem 0.75rem", background: "var(--surface-border)",
    border: "1px solid var(--surface-border)", borderRadius: 8,
    color: "var(--text-primary)", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-sans)",
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Admin</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>User management and platform settings</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* User list */}
            <div className="card">
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Users ({users.length})
              </div>
              {loading && <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading…</div>}
              {users.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.5rem", borderBottom: "1px solid var(--surface-border)",
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--brand-dim)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-light)", flexShrink: 0,
                  }}>
                    {u.full_name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</div>
                  </div>
                  <span className={`badge ${u.role === "admin" ? "badge-high" : "badge-low"}`}>{u.role}</span>
                  <button onClick={() => handleDelete(u.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Create user form */}
            <div className="card">
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Create New User
              </div>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[["full_name", "Full Name", "text"], ["email", "Email", "email"], ["password", "Password", "password"]].map(([f, label, type]) => (
                  <div key={f}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 5 }}>{label}</label>
                    <input type={type} value={(form as any)[f]} required
                      onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                      style={inp} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    style={{ ...inp, appearance: "none" }}>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <button type="submit" disabled={creating} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.65rem", borderRadius: 8, background: "var(--brand)",
                  color: "#fff", border: "none", cursor: creating ? "not-allowed" : "pointer",
                  fontWeight: 500, fontFamily: "var(--font-sans)",
                }}>
                  <UserPlus size={16} /> {creating ? "Creating…" : "Create User"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
