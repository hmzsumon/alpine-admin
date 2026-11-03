/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
/* ────────── authenticated password ────────── */
export function POST(request: NextRequest) {
  return proxy(request, "/api/auth/password");
}
