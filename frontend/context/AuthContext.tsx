"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe } from "@/services/api";
import { insforge } from "@/lib/insforge/client";
import { signInWithPassword, signOut as signOutAction } from "@/app/actions/auth";

interface User { id: string; email: string; full_name: string; role: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (cancelled) return;

      if (error || !data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.profile?.name ?? data.user.email,
            role: "analyst",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithPassword(email, password);
    if (result.error) throw new Error(result.error);
    const me = await getMe();
    setUser(me);
  };

  const logout = async () => {
    await signOutAction();
    setUser(null);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
