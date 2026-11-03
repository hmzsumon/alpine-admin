/* ── Component: OrderManagement ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { Download } from "lucide-react";

import SearchBox from "@/components/ui/SearchBox";
import OrderTable from "@/components/orders/OrderTable";

export default function OrderManagement() {
  /* ────────── workspace state ────────── */
  const { search, setSearch, busy, orders, exportOrders, status } =
    useAdminContext();

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h3>All orders</h3>
          <p>Order lifecycle and payment records</p>
        </div>
        <button className="secondary" onClick={exportOrders}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      <div className="filters">
        <SearchBox value={search} onChange={setSearch} />
      </div>
      <OrderTable orders={orders} onStatus={status} busy={busy} />
    </section>
  );
}
