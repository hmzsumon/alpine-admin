/* ────────── authenticated payment proxy ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export function POST(request: NextRequest, { params }: { params: { id: string } }) { return proxy(request, "/api/orders/" + encodeURIComponent(params.id) + "/payment"); }
