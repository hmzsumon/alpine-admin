/* ────────── imports ────────── */
import { NextRequest, NextResponse } from "next/server";
import {
  backend,
  validOrigin,
  SESSION_COOKIE,
  cookieOptions,
} from "@/lib/server/api";
import { landingPath } from "@/config/access";
/* ────────── sign in and set an HttpOnly session cookie ────────── */
export async function POST(request: NextRequest) {
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  try {
    const response = await backend("/api/auth/login", {
      method: "POST",
      body: await request.text(),
    });
    const result = await response.json();
    if (!response.ok)
      return NextResponse.json(
        { error: result.error || "Sign-in failed" },
        { status: response.status }
      );
    const output = NextResponse.json(
      { user: result.user, redirect: landingPath(result.user) },
      { headers: { "Cache-Control": "no-store" } }
    );
    output.cookies.set(SESSION_COOKIE, result.token, cookieOptions());
    return output;
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the restaurant server" },
      { status: 503 }
    );
  }
}
