import {NextRequest} from "next/server";
import {proxy} from "@/lib/server/api";
export function PATCH(request:NextRequest,{params}:{params:{id:string}}){return proxy(request,"/api/admin/users/shifts/"+encodeURIComponent(params.id));}
