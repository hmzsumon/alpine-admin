/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
/* ────────── MongoDB workspace; no anonymous demo fallback ────────── */
export function GET(request: NextRequest) {
  return proxy(request, "/api/admin/state");
}
export function PATCH(request: NextRequest) {
  return proxy(request, "/api/admin/state");
}
