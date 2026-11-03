/* ────────── authenticated stock API proxy ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) { return proxy(request, "/api/inventory"); }
export function POST(request: NextRequest) { return proxy(request, "/api/inventory"); }
