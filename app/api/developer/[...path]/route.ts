import { NextRequest } from "next/server";
import { developerProxy } from "@/lib/server/developer";
export const maxDuration = 60;
export function GET(r: NextRequest, { params }: { params: { path: string[] } }) { return developerProxy(r, params.path); }
export function POST(r: NextRequest, { params }: { params: { path: string[] } }) { return developerProxy(r, params.path); }
export function DELETE(r: NextRequest, { params }: { params: { path: string[] } }) { return developerProxy(r, params.path); }
