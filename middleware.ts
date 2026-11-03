/* ────────── imports ────────── */
import { NextRequest, NextResponse } from "next/server";
import { canAccessPath, landingPath } from "@/config/access";
import type { AuthUser } from "@/types/auth";

/* ────────── verify the live session on every protected route request ────────── */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("alpine_session")?.value;
  if (!token) {
    if (path === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }
  let user: AuthUser | null = null;
  try {
    const response = await fetch(
      (process.env.API_URL || "http://127.0.0.1:4100") + "/api/auth/me",
      { headers: { Authorization: "Bearer " + token }, cache: "no-store" }
    );
    if (response.ok) user = (await response.json()).user;
  } catch {}
  if (!user) {
    if (path === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (path === "/login" || !canAccessPath(user, path))
    return NextResponse.redirect(new URL(landingPath(user), request.url));
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/orders/:path*",
    "/menu/:path*",
    "/inventory/:path*",
    "/tables/:path*",
    "/kitchen/:path*",
    "/expenses/:path*",
    "/printers/:path*",
    "/users/:path*",
    "/profile/:path*",
  ],
};
