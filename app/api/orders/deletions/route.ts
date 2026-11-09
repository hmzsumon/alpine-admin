import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export function GET(request: NextRequest) { return proxy(request, "/api/orders/deletions"); }
