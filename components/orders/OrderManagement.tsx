/* ── Component: OrderManagement ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { useState } from "react";
import { paidOrder, money } from "@/utils/format";
import { useAuth } from "@/providers/AuthProvider";
import { Download } from "lucide-react";

import SearchBox from "@/components/ui/SearchBox";
import DeletedOrderHistory from "./DeletedOrderHistory";
import OrderTable from "@/components/orders/OrderTable";

export default function OrderManagement() {
  /* ────────── workspace state ────────── */
  const { can } = useAuth();
  const [kind, setKind] = useState("all");
  const { search, setSearch, busy, orders, exportOrders, status, openOrder } =
    useAdminContext();

  const visible = orders.filter((o) => kind === "all" || (kind === "parcel" ? o.items.some((l) => l.fulfillment === "parcel") : o.items.some((l) => l.fulfillment !== "parcel")));
  const paid = visible.filter((o) => paidOrder(o) && o.status !== "Cancelled");
  const parcelSales = paid.reduce((s, o) => s + o.items.filter((l) => l.fulfillment === "parcel").reduce((n, l) => n + l.price * l.quantity, 0), 0);
  const dineSales = paid.reduce((s, o) => s + o.items.filter((l) => l.fulfillment !== "parcel").reduce((n, l) => n + l.price * l.quantity, 0), 0);
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h3>All orders</h3>
          <p>Order lifecycle and payment records</p>
        </div>
        <div className="resource-actions">{can("orders:create") && <button type="button" className="primary" onClick={() => openOrder("PARCEL")}>নতুন পার্সেল</button>}<button className="secondary" onClick={exportOrders}>
          <Download size={16} /> Export CSV
        </button></div>
      </div>
      <div className="parcel-report"><span>তালিকায় পরিশোধিত: এখানে খাওয়া <strong>{money(dineSales)}</strong></span><span>পার্সেলের খাবার <strong>{money(parcelSales)}</strong></span><span>প্যাকিং চার্জ <strong>{money(paid.reduce((s, o) => s + (o.packingCharge || 0), 0))}</strong></span></div>
      <div className="filters"><select aria-label="অর্ডারের ধরন" value={kind} onChange={(e) => setKind(e.target.value)}><option value="all">সব অর্ডার</option><option value="parcel">পার্সেল আছে</option><option value="dine">এখানে খাওয়া আছে</option></select>
        <SearchBox value={search} onChange={setSearch} />
      </div>
      <OrderTable orders={visible} onStatus={status} busy={busy} />
      {can("orders:delete") && <DeletedOrderHistory key={orders.length} />}
    </section>
  );
}
