/* ── Provider: AdminProvider ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import type { ReactNode } from "react";
import { AdminContext } from "@/context/AdminContext";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";

/* ────────── shared workspace provider ────────── */
export default function AdminProvider({ children }: { children: ReactNode }) {
  const workspace = useAdminWorkspace();
  return (
    <AdminContext.Provider value={workspace}>{children}</AdminContext.Provider>
  );
}
