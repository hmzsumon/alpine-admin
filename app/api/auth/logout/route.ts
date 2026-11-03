/* ────────── imports ────────── */
import { NextRequest, NextResponse } from "next/server";
import {
  proxy,
  validOrigin,
  SESSION_COOKIE,
  cookieOptions,
} from "@/lib/server/api";
/* ────────── revoke server session and clear the browser cookie ────────── */
export async function POST(request: NextRequest) {
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  const result = await proxy(request, "/api/auth/logout");
  result.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return result;
}
