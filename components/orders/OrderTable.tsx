/* ── Component: OrderTable ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import type { Order } from "@/types";
import { money, total } from "@/utils/format";
import Empty from "@/components/ui/EmptyState";

export default function OrderTable({
  orders,
  onStatus,
  busy,
}: {
  orders: Order[];
  onStatus: (id: string, s: Order["status"]) => void;
  busy: boolean;
}) {
  const { can } = useAuth();
  const optionsFor = (status: Order["status"]) => [
    status,
    ...(can("orders:update") && status === "New" ? ["Preparing"] : []),
    ...(can("orders:update") && status === "Preparing" ? ["Ready"] : []),
    ...(can("payments:collect") && status === "Ready" ? ["Paid"] : []),
    ...(can("orders:cancel") ? ["Cancelled"] : []),
  ];
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Table</th>
            <th>Waiter</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.id}</strong>
              </td>
              <td>{o.table}</td>
              <td>{o.waiter}</td>
              <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
              <td>{money(total(o))}</td>
              <td>
                <span className={`badge ${o.status}`}>{o.status}</span>
              </td>
              <td>
                {!["Paid", "Cancelled"].includes(o.status) && (
                  <select
                    disabled={busy || optionsFor(o.status).length === 1}
                    aria-label={`Update ${o.id}`}
                    value={o.status}
                    onChange={(e) =>
                      onStatus(o.id, e.target.value as Order["status"])
                    }
                  >
                    {optionsFor(o.status).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <Empty text="No orders yet. A fresh start for great service." />
      )}
    </div>
  );
}
