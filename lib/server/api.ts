/* ────────── imports ────────── */
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { AuthUser } from "@/types/auth";
export const SESSION_COOKIE = "alpine_session";

/* ────────── server-only authenticated API requests ────────── */
export async function backend(path: string, options: RequestInit = {}) {
  const origin = process.env.API_URL;
  if (!origin) throw new Error("API_URL is not configured");
  return fetch(origin + path, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
}
export function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    // Next may normalize request.url to localhost; compare the actual HTTP Host.
    return ["http:", "https:"].includes(parsed.protocol) && parsed.host === new URL(parsed.protocol + "//" + host).host;
  } catch { return false; }
}
export function cookieOptions() {
  return {
    httpOnly: true,
    secure:
      process.env.COOKIE_SECURE !== "false" &&
      process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 8 * 60 * 60,
  };
}
export async function currentUser(): Promise<AuthUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const response = await backend("/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!response.ok) return null;
    return (await response.json()).user;
  } catch {
    return null;
  }
}
export async function proxy(request: NextRequest, path: string) {
  if (!["GET", "HEAD"].includes(request.method) && !validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  try {
    const response = await backend(path, {
      method: request.method,
      headers: { Authorization: "Bearer " + token },
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.text(),
    });
    const result = NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (response.status === 401)
      result.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
    return result;
  } catch {
    return NextResponse.json(
      { error: "Restaurant API unavailable. Please retry." },
      { status: 503 }
    );
  }
}
