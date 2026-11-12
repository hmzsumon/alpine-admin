import {NextRequest} from "next/server";
import {proxy} from "@/lib/server/api";
export const dynamic="force-dynamic";
export function GET(request:NextRequest,{params}:{params:{id:string}}){return proxy(request,"/api/admin/users/"+encodeURIComponent(params.id)+"/details?"+new URLSearchParams({from:request.nextUrl.searchParams.get("from")||"",to:request.nextUrl.searchParams.get("to")||""}));}
