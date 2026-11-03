/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
/* ────────── authenticated me ────────── */
export function GET(request: NextRequest) {
  return proxy(request, "/api/auth/me");
}
