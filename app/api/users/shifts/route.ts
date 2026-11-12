import {NextRequest} from "next/server";
import {proxy} from "@/lib/server/api";
export const dynamic="force-dynamic";
export function GET(request:NextRequest){return proxy(request,"/api/admin/users/shifts");}
export function POST(request:NextRequest){return proxy(request,"/api/admin/users/shifts");}
