/* ── Component: DeletedOrderHistory; private audit summary for delegated responsibility ── */
"use client";
import { useState } from "react";
import { money } from "@/utils/format";
interface Entry { id: string; table: string; total: number; deletedAt: string; actor: string; reason: string; paid: boolean; }
export default function DeletedOrderHistory() {
  const [records, setRecords] = useState<Entry[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState("");
  return <details className="deleted-order-history" onToggle={async e => {
    if (!e.currentTarget.open || busy) return; setBusy(true); setError("");
    try { const r = await fetch("/api/orders/deletions", { cache: "no-store" }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setRecords(data.records); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "ইতিহাস পাওয়া যায়নি।"); } finally { setBusy(false); }
  }}><summary>ডিলিটের ইতিহাস · সর্বশেষ ১০০টি</summary>{busy ? <p>লোড হচ্ছে…</p> : error ? <p role="alert">{error}</p> : <div className="table-scroll"><table><thead><tr><th>অর্ডার</th><th>পরিমাণ</th><th>কে / কখন</th><th>কারণ</th></tr></thead><tbody>{records.map(record => <tr key={record.id}><td>{record.table}<small className="item-note">{record.id}</small></td><td>{money(record.total)}<small className="item-note">{record.paid ? "পরিশোধিত ছিল" : "বাকি ছিল"}</small></td><td>{record.actor}<small className="item-note">{new Date(record.deletedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</small></td><td>{record.reason}</td></tr>)}</tbody></table>{!records.length && <p>এখনো কোনো অর্ডার ডিলিট হয়নি।</p>}</div>}</details>;
}
