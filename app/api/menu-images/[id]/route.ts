/* ────────── authenticated Cloudinary cleanup proxy ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return proxy(request, "/api/admin/menu-images/" + encodeURIComponent(params.id));
}
