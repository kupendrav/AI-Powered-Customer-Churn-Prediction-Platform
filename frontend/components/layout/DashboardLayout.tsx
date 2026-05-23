"use client";
import { ReactNode } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onLogout={logout} userName={user?.full_name ?? user?.email ?? "User"} userRole={user?.role} />
      <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
