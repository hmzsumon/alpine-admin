/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
/* ────────── owner-only user operations ────────── */
export function GET(request: NextRequest) {
  return proxy(request, "/api/admin/users");
}
export function POST(request: NextRequest) {
  return proxy(request, "/api/admin/users");
}
