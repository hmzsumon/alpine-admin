/* ── Component: CancelOrderForm ────────────────────────────────────────── */
"use client";
import { useAdminContext } from "@/context/AdminContext";
export default function CancelOrderForm() {
  const { data, cancelOrderId, cancelOrder, busy } = useAdminContext();
  const order = data.orders.find((order) => order.id === cancelOrderId);
  if (!order) return <p className="info-note">Order no longer exists. Refresh the workspace.</p>;
  return <form onSubmit={async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await cancelOrder(order.id, String(form.get("reason")).trim(), form.get("prepared") === "on");
  }}>
    <div className="info-note">{order.table} · {order.id}<br />Unprepared food returns to availability. Prepared food is recorded as waste.</div>
    <label>Cancellation reason *<input name="reason" required minLength={3} maxLength={300} placeholder="e.g. Customer changed the order" /></label>
    <label className="check-label"><input type="checkbox" name="prepared" defaultChecked={order.status !== "New"} />Preparation has started / food was issued</label>
    <p className="muted">Food already marked Preparing or Ready cannot be returned to stock automatically.</p>
    <button type="submit" className="primary" disabled={busy}>{busy ? "Cancelling…" : "Confirm cancellation"}</button>
  </form>;
}
