/* ────────── imports ────────── */
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/auth/Layout";
import AdminProvider from "@/providers/AdminProvider";
import AuthProvider from "@/providers/AuthProvider";
import { currentUser } from "@/lib/server/api";
/* ────────── authenticated dashboard layout ────────── */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <AuthProvider initialUser={user}>
      <AdminProvider>
        <DashboardShell>{children}</DashboardShell>
      </AdminProvider>
    </AuthProvider>
  );
}
