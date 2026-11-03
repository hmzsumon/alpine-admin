/* ────────── imports ────────── */
import { NextRequest, NextResponse } from "next/server";
import { backend, SESSION_COOKIE } from "@/lib/server/api";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  try {
    const response = await backend(
      "/api/kot/" + encodeURIComponent(params.id) + "/preview",
      { headers: { Authorization: "Bearer " + token } }
    );
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "KOT preview unavailable" },
      { status: 503 }
    );
  }
}
