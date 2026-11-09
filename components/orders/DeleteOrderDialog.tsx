/* ── Component: DeleteOrderDialog; refreshable preview and explicit destructive confirmation ── */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAdminContext } from "@/context/AdminContext";
import { money } from "@/utils/format";
interface Preview { id: string; table: string; total: number; status: string; paid: boolean; preparedRequired: boolean; fingerprint: string; }
export default function DeleteOrderDialog({ id, close }: { id: string; close: () => void }) {
  const { refreshWorkspace, setNotice } = useAdminContext();
  const [preview, setPreview] = useState<Preview>(), [reason, setReason] = useState(""), [prepared, setPrepared] = useState(false), [confirmed, setConfirmed] = useState(false), [loading, setLoading] = useState(true), [deleting, setDeleting] = useState(false), [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null), sending = useRef(false);
  const load = useCallback(async () => {
    setLoading(true); setError(""); setConfirmed(false); setPreview(undefined);
    try { const r = await fetch(`/api/orders/${encodeURIComponent(id)}/delete-preview`, { cache: "no-store" }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setPreview(data); setPrepared(data.preparedRequired); }
    catch (e) { setError(e instanceof Error ? e.message : "তথ্য পাওয়া যায়নি।"); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); const previous = document.activeElement as HTMLElement | null; dialog.current?.focus(); return () => previous?.focus(); }, [load]);
  return <div className="modal-backdrop"><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="delete-order-title" tabIndex={-1} className="modal" onKeyDown={e => {
    if (e.key === "Escape" && !sending.current) close();
    if (e.key === "Tab") { const nodes = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)'); if (!nodes?.length) return; const first = nodes[0], last = nodes[nodes.length - 1]; if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }}>
    <div className="panel-title"><h3 id="delete-order-title">অর্ডার ডিলিট করুন</h3><button type="button" className="icon-button" aria-label="বন্ধ করুন" disabled={deleting} onClick={close}><X size={19} /></button></div>
    <form onSubmit={async e => {
      e.preventDefault(); if (!preview || !confirmed || sending.current || reason.trim().length < 3) return;
      sending.current = true; setDeleting(true); setError("");
      try { const r = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fingerprint: preview.fingerprint, reason: reason.trim(), prepared }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); await refreshWorkspace(); setNotice("অর্ডার ডিলিট হয়েছে। ডিলিটের ইতিহাসে রেকর্ড রাখা হয়েছে।"); close(); }
      catch (problem) { setConfirmed(false); setError(problem instanceof Error ? problem.message : "নিশ্চিত হয়নি। তথ্য রিফ্রেশ করে দেখুন।"); }
      finally { sending.current = false; setDeleting(false); }
    }}>
      {loading && <p className="info-note">অর্ডারের সর্বশেষ তথ্য নেওয়া হচ্ছে…</p>}
      {error && <p role="alert" className="info-note danger-text">{error}</p>}
      {preview && <>
        <p className="info-note"><strong>{preview.table} · {money(preview.total)}</strong><br />{preview.id}<br />{preview.status} · {preview.paid ? "পরিশোধিত" : "বাকি"}</p>
        <p className="muted">ডিলিট হলে তালিকা ও বিক্রয় রিপোর্ট থেকে এই অর্ডার বাদ যাবে। মূল অর্ডার, কারণ ও দায়িত্বপ্রাপ্ত ব্যক্তির রেকর্ড সংরক্ষিত থাকবে।{preview.paid ? " গ্রহণ করা টাকা স্বয়ংক্রিয়ভাবে ফেরত যাবে না।" : ""}</p>
        <label>ডিলিটের কারণ *<textarea required minLength={3} maxLength={300} value={reason} disabled={deleting} onChange={e => setReason(e.target.value)} placeholder="যেমন: ভুল করে একই অর্ডার দুবার নেওয়া হয়েছে" /></label>
        <label className="check-label"><input type="checkbox" checked={prepared} disabled={deleting || preview.preparedRequired} onChange={e => setPrepared(e.target.checked)} />রান্না শুরু হয়েছে / খাবার কিচেনে দেওয়া হয়েছে</label>
        <p className="muted">রান্না না হলে সংরক্ষিত স্টক ছাড়বে। রান্না শুরু হওয়া খাবার স্টকে ফেরত যাবে না; প্রযোজ্য হলে অপচয় হিসেবে থাকবে।</p>
        <label className="check-label"><input type="checkbox" required checked={confirmed} disabled={deleting} onChange={e => setConfirmed(e.target.checked)} />আমি এই অর্ডারটি ডিলিট করতে নিশ্চিত</label>
      </>}
      <div className="resource-actions"><button type="button" className="secondary" disabled={loading || deleting} onClick={() => void load()}>তথ্য রিফ্রেশ</button><button type="button" className="secondary" disabled={deleting} onClick={close}>ফিরে যান</button>{preview && <button type="submit" className="delete-order-confirm" disabled={deleting || loading || !confirmed || reason.trim().length < 3}>{deleting ? "ডিলিট হচ্ছে…" : "নিশ্চিত করে ডিলিট"}</button>}</div>
    </form>
  </div></div>;
}
