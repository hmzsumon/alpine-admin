/* ── Component: KitchenManagement ────────────────────────────────────── */
"use client";
import { useState, useCallback } from "react";
import { Plus, Flame, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import type { Kitchen } from "@/types";
import SetupDialog from "@/components/setup/SetupDialog";
import ResourceForm from "@/components/setup/ResourceForm";
export default function KitchenManagement() {
  const { can } = useAuth();
  const { data, kitchens, save, busy, mode, setNotice } = useAdminContext();
  const [editing, setEditing] = useState<Kitchen | null | undefined>();
  const [suggestedId, setSuggestedId] = useState("");
  const close = useCallback(() => setEditing(undefined), []);
  return <section className="panel resource-kitchens"><div className="panel-title"><div><h3>কিচেন পরিচালনা <span className="count-pill">{kitchens.length}</span></h3><p>নতুন কিচেন যোগ করে মেনু ও অপারেটরকে বরাদ্দ দিন। নাম পরিবর্তন করলে রাউটিং কোড বদলায় না।</p></div>{can("kitchen:manage") && <button type="button" className="primary" disabled={busy || mode !== "database"} onClick={() => { setSuggestedId(`K-${crypto.randomUUID().slice(0, 8)}`); setEditing(null); }}><Plus size={16} /> নতুন কিচেন</button>}</div>
    <div className="kitchen-setup-grid">{kitchens.map((kitchen) => {
      const items = data.menu.filter((m) => m.station === kitchen.id).length;
      return <div key={kitchen.id} className="kitchen-setup-card"><Flame size={22} /><h3>{kitchen.name}</h3><p>{kitchen.floor} · {items}টি আইটেম</p><small className="muted">কোড: {kitchen.id}</small>{can("kitchen:manage") && <div className="resource-actions"><button type="button" className="text-button" disabled={busy || mode !== "database"} onClick={() => setEditing(kitchen)}><Pencil size={14} /> এডিট</button><button type="button" className="text-button danger-text" disabled={busy || mode !== "database"} onClick={async () => {
        if (items || data.inventory?.pools.some((p) => p.station === kitchen.id)) { setNotice("এই কিচেনে মেনু বা স্টক আছে। আগে অন্য কিচেনে নিন।"); return; }
        if (data.printers.some((p) => p.station === kitchen.id && p.enabled)) { setNotice("এই কিচেনের প্রিন্টার চালু আছে। আগে Printers থেকে বন্ধ করুন।"); return; }
        if (!window.confirm(`“${kitchen.name}” কিচেন ডিলিট করবেন? চলমান কাজ থাকলে আগে শেষ করতে হবে। পুরোনো ইতিহাস থাকবে।`)) return;
        if (await save({ ...data, kitchens: kitchens.filter((k) => k.id !== kitchen.id) })) setNotice("কিচেন ডিলিট হয়েছে। পুরোনো অর্ডার ও KOT-এর ইতিহাস থাকবে।");
      }}><Trash2 size={14} /> ডিলিট</button></div>}</div>;
    })}</div>
    {!kitchens.length && <p className="info-note">নতুন কিচেন যোগ করুন, তারপর মেনু আইটেমে সেই কিচেন বেছে নিন।</p>}
    {editing !== undefined && <SetupDialog title={editing ? "কিচেন এডিট" : "নতুন কিচেন"} busy={busy} close={close}><ResourceForm kind="kitchen" value={editing || undefined} suggestedId={suggestedId} busy={busy} submit={async ({ seats: _seats, ...entry }) => {
      if (kitchens.some((k) => k.id !== editing?.id && (k.id === entry.id || k.name.toLowerCase() === entry.name.toLowerCase()))) { setNotice("এই কোড বা নামে কিচেন আছে। আলাদা কোড ও নাম দিন।"); return false; }
      const saved = await save({ ...data, kitchens: editing ? kitchens.map((k) => k.id === editing.id ? entry : k) : [...kitchens, entry] });
      if (saved) { close(); setNotice("কিচেন সেভ হয়েছে। মেনু ও কর্মীর দায়িত্বে এই কিচেন নির্বাচন করতে পারবেন। প্রিন্টার সেটআপ আলাদা।"); } return saved;
    }} /></SetupDialog>}
  </section>;
}
