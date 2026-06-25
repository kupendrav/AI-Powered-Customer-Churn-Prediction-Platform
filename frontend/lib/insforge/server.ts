import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { insforgeConfig } from "./config";

export async function createInsForgeServerClient() {
  return createServerClient({
    ...insforgeConfig,
    cookies: await cookies(),
  });
}
