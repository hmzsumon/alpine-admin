/* ────────── protected standalone print page: no sidebar or waiter controls ────────── */
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { currentUser, backend, SESSION_COOKIE } from "@/lib/server/api";
import PrintablePurchase from "@/components/procurement/PrintablePurchase";
export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.permissions.includes("procurement:read")) redirect("/dashboard");
  const r = await backend(
    "/api/procurement/records/" + encodeURIComponent(params.id),
    {
      headers: {
        Authorization: "Bearer " + cookies().get(SESSION_COOKIE)?.value,
      },
    },
  );
  if (!r.ok)
    return (
      <main style={{ padding: 30 }}>
        ফরম পাওয়া যায়নি বা সার্ভারে সংযোগ হয়নি। আবার চেষ্টা করুন।
      </main>
    );
  const data = await r.json();
  if (!["demand", "receipt"].includes(data.record.kind)) notFound();
  return (
    <PrintablePurchase
      record={data.record}
      catalog={data.catalog}
      related={data.related}
      printedBy={user.name}
    />
  );
}
