/* ────────── authenticated same-origin import proxy; no anonymous file endpoint ────────── */
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/server/api";
export const maxDuration = 60;
export function POST(request: NextRequest, { params }: { params: { action: string } }) {
  if (!["parse","preview","apply"].includes(params.action)) return NextResponse.json({error:"Not found"},{status:404});
  return proxy(request,"/api/admin/menu-import/"+params.action);
}
export function GET(request: NextRequest, { params }: { params: { action: string } }) {
  if (params.action!=="export") return NextResponse.json({error:"Not found"},{status:404});
  return proxy(request,"/api/admin/menu-import/export?mode="+(request.nextUrl.searchParams.get("mode")==="current"?"current":"template"));
}
