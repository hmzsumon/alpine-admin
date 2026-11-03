/* ────────── imports ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
/* ────────── owner-only staff updates ────────── */
export function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!/^[a-f0-9]{24}$/i.test(params.id))
    return new Response(null, { status: 400 });
  return proxy(request, "/api/admin/users/" + params.id);
}
