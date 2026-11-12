/* ────────── authenticated cashier/owner bill preview, using the saved order ────────── */
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { backend, currentUser, SESSION_COOKIE } from "@/lib/server/api";
import PrintableBill from "@/components/orders/PrintableBill";
import type { Order } from "@/types";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!["orders:read", "payments:collect"].every(permission => user.permissions.includes(permission as "orders:read" | "payments:collect"))) redirect("/orders");
  const response = await backend("/api/waiter/orders/" + encodeURIComponent(params.id), {
    headers: { Authorization: "Bearer " + cookies().get(SESSION_COOKIE)?.value },
  });
  if (response.status === 404) notFound();
  if (response.status === 403) redirect("/orders");
  if (!response.ok) return <main style={{ padding: 30 }}>বিল লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।</main>;
  const data: { order: Order } = await response.json();
  return <PrintableBill order={data.order} printedBy={user.name} previewAt={new Date().toISOString()} />;
}
