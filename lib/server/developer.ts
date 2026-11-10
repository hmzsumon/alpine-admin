/* ────────── private developer grant stays in a separate HttpOnly cookie ────────── */
import { NextRequest, NextResponse } from "next/server";
import { backend, validOrigin, SESSION_COOKIE, cookieOptions } from "./api";
const COOKIE = "alpine_developer";
export async function developerProxy(request: NextRequest, segments: string[]) {
  if (!["GET", "HEAD"].includes(request.method) && !validOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const primary = request.cookies.get(SESSION_COOKIE)?.value;
  if (!primary) return NextResponse.json({ error: "Owner হিসেবে লগইন করুন।" }, { status: 401 });
  try {
    const r = await backend("/api/developer/" + segments.map(encodeURIComponent).join("/"), { method: request.method, headers: { Authorization: "Bearer " + primary, "x-alpine-developer": request.cookies.get(COOKIE)?.value || "" }, ...(["GET", "HEAD"].includes(request.method) ? {} : { body: await request.text() }) });
    const data = await r.json();
    const unlock = segments.join("/") === "unlock" && r.ok;
    const output = NextResponse.json(unlock ? { unlocked: true, expiresAt: data.expiresAt } : data, { status: r.status, headers: { "Cache-Control": "private, no-store" } });
    if (unlock) output.cookies.set(COOKIE, data.token, { ...cookieOptions(), path: "/api/developer", maxAge: 900 });
    if (segments.join("/") === "session" || r.status === 403) output.cookies.set(COOKIE, "", { ...cookieOptions(), path: "/api/developer", maxAge: 0 });
    return output;
  } catch { return NextResponse.json({ error: "Developer server-এ যোগাযোগ হয়নি।" }, { status: 503 }); }
}
