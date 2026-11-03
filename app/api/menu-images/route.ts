/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";

/* ────────── authenticated image upload proxy ────────── */
export function POST(request: NextRequest) {
  return proxy(request, "/api/admin/menu-images");
}
