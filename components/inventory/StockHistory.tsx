/* ── Component: StockHistory ──────────────────────────────────────────── */
"use client";
import { Download } from "lucide-react";
import type { StockClosing, StockEvent } from "@/types/inventory";
const time = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });
function download(closing: StockClosing) {
  const cell = (value: unknown) => '"' + (typeof value === "string" ? value.replace(/^[=+@\-\t\r]/, "'$&") : String(value ?? "")).replaceAll('"', '""') + '"';
  const rows = [["Date", "Stock item", "Unit", "Opening", "Added", "Issued", "Sold", "Waste", "Staff meal", "Adjustment", "Expected", "Actual", "Variance", "Reason", "Approved by"],
    ...closing.rows.map((row) => [closing.date, row.name, row.unit, row.opening, row.received, row.issued, row.sold,
      row.manualWaste + row.cancelledWaste, row.staffMeal, row.adjustment, row.expected, row.actual, row.variance, row.reason, closing.closedBy])];
  const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `alpine-stock-closing-${closing.date}.csv`; link.click(); URL.revokeObjectURL(url);
}
export default function StockHistory({ history, closings }: { history: StockEvent[]; closings: StockClosing[] }) {
  return <div className="inventory-history-grid">
    <section className="panel"><div className="panel-title"><div><h3>Daily closing reports</h3><p>Last 30 closings · Physical counts and manager approval</p></div></div>
      {!closings.length && <p className="inventory-empty">Your first closing report will appear here.</p>}
      {closings.map((closing) => <details className="inventory-closing" key={closing.id}><summary><strong>{closing.date}</strong><span>{closing.closedBy} · {closing.rows.filter((row) => row.variance !== 0).length} differences</span></summary>
        <div className="inventory-closing-header"><p>{time(closing.closedAt)} · {closing.note || "Counts confirmed"}</p><button type="button" className="secondary" onClick={() => download(closing)}><Download size={14} /> Export CSV</button></div>
        <div className="table-scroll"><table><thead><tr><th>Item / unit</th><th>Open</th><th>Added</th><th>Issued</th><th>Sold</th><th>Waste</th><th>Staff</th><th>Adjust</th><th>Expected</th><th>Actual</th><th>Difference</th><th>Reason</th></tr></thead>
          <tbody>{closing.rows.map((row) => <tr key={row.poolId}><td>{row.name}<small className="item-note">{row.unit}</small></td><td>{row.opening}</td><td>{row.received}</td><td>{row.issued}</td><td>{row.sold}</td><td>{row.manualWaste + row.cancelledWaste}</td><td>{row.staffMeal}</td><td>{row.adjustment}</td><td>{row.expected}</td><td>{row.actual}</td><td className={row.variance ? "amber-text" : ""}>{row.variance > 0 ? "+" : ""}{row.variance}</td><td>{row.reason || "—"}</td></tr>)}</tbody></table></div>
        <p className="inventory-help">Expected = opening + added + adjustments − issued − manual waste − staff meals. Prepared cancellations are included in issued stock and waste reporting; they are not deducted twice.</p>
      </details>)}
    </section>
    <section className="panel"><div className="panel-title"><div><h3>Stock activity</h3><p>Latest 100 movements · Full history is archived</p></div></div>
      <div className="table-scroll inventory-audit"><table><thead><tr><th>When / staff</th><th>Food</th><th>Movement</th><th>Qty / change</th><th>Reason / order</th></tr></thead><tbody>{history.map((event) => <tr key={event.id}><td>{time(event.at)}<small className="item-note">{event.actor}</small></td><td>{event.poolName || "Stock day"}</td><td><span className="inventory-kind">{event.kind.replaceAll("_", " ")}</span></td><td>{event.quantity ?? "—"} {event.unit}<small className="item-note">{event.delta ? `${event.delta > 0 ? "+" : ""}${event.delta}` : "No balance change"}</small></td><td>{event.note}<small className="item-note">{event.orderId}</small></td></tr>)}</tbody></table></div>
      {!history.length && <p className="inventory-empty">Recorded stock movements will appear here.</p>}
    </section>
  </div>;
}
