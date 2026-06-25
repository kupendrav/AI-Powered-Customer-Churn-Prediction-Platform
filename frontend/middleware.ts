import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import type { CookieStore } from "@insforge/sdk/ssr";
import { insforgeConfig } from "@/lib/insforge/config";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  await updateSession({
    ...insforgeConfig,
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies as unknown as CookieStore,
  });

  return response;
}
