/* ────────── hidden owner-only console; deliberately absent from navigation ────────── */
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/api";
import DeveloperConsole from "@/components/developer/DeveloperConsole";
export const dynamic = "force-dynamic";
export const metadata = { title: "Developer · Alpine", robots: { index: false, follow: false } };
export default async function DeveloperPage() {
  const user = await currentUser(); if (!user) redirect("/login"); if (user.role !== "owner") redirect("/profile");
  return <DeveloperConsole owner={user.name} />;
}
