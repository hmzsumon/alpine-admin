/* ── Component: StockMovementForm ──────────────────────────────────────── */
"use client";
import type { StockCommand, StockPool } from "@/types/inventory";
const labels: Record<string, string> = { receive: "New preparation / delivery", waste: "Waste / spoilage", staff_meal: "Staff meal", adjustment: "Manager adjustment" };
export default function StockMovementForm({ pool, action, command, busy, onDone }: {
  pool: StockPool; action: string; command: StockCommand; busy: boolean; onDone: () => void;
}) {
  return <form onSubmit={async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (await command({ action, poolId: pool.id, quantity: Number(form.get("quantity")), note: String(form.get("note")).trim() })) onDone();
  }}>
    <div className="inventory-help"><strong>{pool.name}</strong> · {pool.station}<br />{labels[action]} · Unit: {pool.unit}</div>
    <label>{action === "adjustment" ? "Adjustment (+ add / − reduce)" : "Quantity"} *<input name="quantity" type="number" required min={action === "adjustment" ? -1000000 : 1} max={1000000} step={1} /></label>
    <label>Reason / reference *<input name="note" required minLength={3} maxLength={300} placeholder={action === "receive" ? "e.g. Lunch batch, 20 portions prepared" : "Why is this stock changing?"} /></label>
    <p className="inventory-help">Reserved quantities cannot be removed by a manual stock movement.</p>
    <button type="submit" className="primary" disabled={busy}>{busy ? "Recording…" : "Record movement"}</button>
  </form>;
}
