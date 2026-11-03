/* ────────── append dine-in or parcel items to the same unpaid bill ────────── */
import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export function POST(request: NextRequest, { params }: { params: { id: string } }) { return proxy(request, "/api/waiter/orders/" + encodeURIComponent(params.id) + "/items"); }
