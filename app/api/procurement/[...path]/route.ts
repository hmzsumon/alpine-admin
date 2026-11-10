/* ────────── same-origin HttpOnly session proxy; backend authorizes every action ────────── */
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/server/api";
export const maxDuration = 60;
function endpoint(r: NextRequest, parts: string[]) {
  const path = parts.map(encodeURIComponent).join("/");
  const query = new URLSearchParams();
  for (const key of ["page", "kind", "supplierId", "from", "to"]) {
    const v = r.nextUrl.searchParams.get(key);
    if (v) query.set(key, v);
  }
  return (
    "/api/procurement/" + path + (query.size ? "?" + query.toString() : "")
  );
}
export function GET(
  r: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (!["view", "records", "suppliers"].includes(params.path[0]))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return proxy(r, endpoint(r, params.path));
}
export function POST(
  r: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (params.path.join("/") !== "command")
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return proxy(r, endpoint(r, params.path));
}
