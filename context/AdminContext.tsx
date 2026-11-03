/* ── Context: AdminContext ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { createContext, useContext } from "react";
import type { useAdminWorkspace } from "@/hooks/useAdminWorkspace";

/* ────────── typed workspace context ────────── */
export const AdminContext = createContext<ReturnType<
  typeof useAdminWorkspace
> | null>(null);
export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("Admin components require AdminProvider");
  return context;
}
