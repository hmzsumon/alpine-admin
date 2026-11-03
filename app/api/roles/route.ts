import { NextRequest } from "next/server";
import { proxy } from "@/lib/server/api";
export const dynamic = "force-dynamic";
export const GET = (request: NextRequest) => proxy(request, "/api/admin/roles");
export const POST = (request: NextRequest) => proxy(request, "/api/admin/roles");
