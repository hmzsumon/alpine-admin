/* ── Component: StockDayForm ───────────────────────────────────────────── */
"use client";
import { useState } from "react";
import type { InventoryView, StockCommand } from "@/types/inventory";
export default function StockDayForm({ data, closing, command, busy, onDone }: {
  data: InventoryView; closing: boolean; command: StockCommand; busy: boolean; onDone: () => void;
}) {
  const pools = data.inventory.pools.filter((pool) => pool.mode === "counted");
  const [counts, setCounts] = useState<Record<string, string>>(() => Object.fromEntries(pools.map((pool) => [pool.id, closing ? "" : String(pool.onHand)])));
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const blocked = closing && data.pendingOrders > 0;
  return <form onSubmit={async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (await command({ action: closing ? "close" : "open", note: String(form.get("note")).trim(),
      entries: pools.map((pool) => ({ poolId: pool.id, quantity: Number(counts[pool.id]), reason: reasons[pool.id] || "" })) })) onDone();
  }}>
    <div className="inventory-help">{closing ? "Count the remaining food physically. Differences need a reason and manager approval."
      : "Confirm actual opening quantities. Previous closing stock is prefilled; do not add it twice."}<br />Business date: {closing ? data.inventory.day?.date : data.businessDate} · Asia/Dhaka</div>
    {blocked && <p className="form-error">{data.pendingOrders} open order(s). Settle or cancel them before closing.</p>}
    <div className="table-scroll inventory-count-table"><table><thead><tr><th>Food / unit</th><th>{closing ? "Expected" : "Previous balance"}</th><th>{closing ? "Actual count *" : "Opening count *"}</th><th>Difference reason</th></tr></thead>
      <tbody>{pools.map((pool) => {
        const count = counts[pool.id] ?? "", changed = count !== "" && Number(count) !== pool.onHand;
        const reasonRequired = changed && (closing || pool.onHand !== 0);
        return <tr key={pool.id}><td><strong>{pool.name}</strong><small className="item-note">{pool.unit}</small></td><td>{pool.onHand}</td>
          <td><input aria-label={`${pool.name} ${closing ? "actual" : "opening"} count`} type="number" min={0} max={1000000} step={1} required value={count}
            onChange={(event) => setCounts({ ...counts, [pool.id]: event.target.value })} /></td>
          <td><input aria-label={`${pool.name} difference reason`} required={reasonRequired} minLength={reasonRequired ? 3 : undefined} maxLength={300}
            placeholder={reasonRequired ? `Difference: ${Number(count) - pool.onHand}. Explain…` : "Optional"}
            value={reasons[pool.id] || ""} onChange={(event) => setReasons({ ...reasons, [pool.id]: event.target.value })} /></td></tr>;
      })}</tbody></table></div>
    {!pools.length && <p className="inventory-help">No counted groups configured. Only availability controls will be used.</p>}
    <label>{closing ? "Closing note" : "Opening note"}<input name="note" maxLength={300} placeholder="Shift note (optional)" /></label>
    <label className="check-label"><input type="checkbox" required />{closing ? "I checked the physical counts. This closing is final for this business date." : "I checked the opening quantities and carryover stock."}</label>
    <button type="submit" className="primary" disabled={busy || blocked}>{busy ? "Saving…" : closing ? "Approve & close day" : "Confirm & open day"}</button>
  </form>;
}
