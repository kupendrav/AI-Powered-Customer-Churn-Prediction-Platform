"use server";

import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";
import { insforgeConfig } from "@/lib/insforge/config";

type AuthState = {
  user: unknown | null;
  error: string | null;
  requireEmailVerification?: boolean;
};

function errorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Authentication failed";
  if ("message" in error && typeof error.message === "string") return error.message;
  return "Authentication failed";
}

export async function signInWithPassword(email: string, password: string): Promise<AuthState> {
  const auth = createAuthActions({ ...insforgeConfig, cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error) return { user: null, error: errorMessage(error) };
  return { user: data?.user ?? null, error: null };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name: string,
): Promise<AuthState> {
  const auth = createAuthActions({ ...insforgeConfig, cookies: await cookies() });
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`;
  const { data, error } = await auth.signUp({ email, password, name, redirectTo });

  if (error) return { user: null, error: errorMessage(error) };
  return {
    user: data?.user ?? null,
    error: null,
    requireEmailVerification: Boolean(data?.requireEmailVerification),
  };
}

export async function verifyEmailCode(email: string, otp: string): Promise<AuthState> {
  const auth = createAuthActions({ ...insforgeConfig, cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error) return { user: null, error: errorMessage(error) };
  return { user: data?.user ?? null, error: null };
}

export async function signOut() {
  const auth = createAuthActions({ ...insforgeConfig, cookies: await cookies() });
  await auth.signOut();
}
