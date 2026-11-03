/* ── Component: TableManagement ───────────────────────────────────────── */
"use client";
import { useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Plus, Table2, Pencil, Trash2 } from "lucide-react";
import { money, total } from "@/utils/format";
import SetupDialog from "@/components/setup/SetupDialog";
import ResourceForm from "@/components/setup/ResourceForm";
import type { RestaurantTable } from "@/types";
export default function TableManagement() {
  const { can } = useAuth();
  const { data, tables, floor, setFloor, active, openOrder, save, busy, mode, setNotice } = useAdminContext();
  const [editing, setEditing] = useState<RestaurantTable | null | undefined>();
  const close = useCallback(() => setEditing(undefined), []);
  const floors = [...new Set(tables.map((t) => t.floor))];
  const visible = floor === "All floors" || !floors.includes(floor) ? tables : tables.filter((t) => t.floor === floor);
  const nextNumber = Math.max(0, ...[...tables.map((t) => t.id), ...(data.retiredTableIds || [])].map((id) => Number(id.slice(2)))) + 1;
  return <>
    <div className="resource-toolbar"><div><h2>টেবিল পরিচালনা</h2><p className="muted">{tables.length}টি টেবিল · {floors.length}টি ফ্লোর</p></div>{can("tables:manage") && <button type="button" className="primary" disabled={busy || mode !== "database"} onClick={() => setEditing(null)}><Plus size={17} /> নতুন টেবিল</button>}</div>
    <div className="filters floor-filters">{["All floors", ...floors].map((f) => <button type="button" key={f} className={(floor === f || (f === "All floors" && !floors.includes(floor))) ? "primary" : "secondary"} onClick={() => setFloor(f)}>{f === "All floors" ? "সব ফ্লোর" : f}</button>)}</div>
    <div className="table-grid">{visible.map((table) => {
      const current = active.filter((o) => o.table === table.id);
      return <article key={table.id} className={`table-card resource-table-card ${current.length ? "occupied" : ""}`}>
        <div><Table2 size={23} /><span className={`badge ${current.length ? "Preparing" : "Ready"}`}>{current.length ? "ব্যস্ত" : "খালি"}</span></div>
        <h3>{table.name}</h3><p>{table.id} · {table.floor} · {table.seats} আসন</p>
        <footer>{current.length ? `${current.length} অর্ডার · ${money(current.reduce((s, o) => s + total(o), 0))}` : "নতুন অর্ডার নেওয়া যাবে"}</footer>
        <div className="resource-actions">{can("orders:create") && <button type="button" className="secondary" disabled={busy} onClick={() => openOrder(table.id)}><Plus size={15} /> অর্ডার</button>}{can("tables:manage") && <><button type="button" className="text-button" disabled={busy || mode !== "database"} onClick={() => setEditing(table)}><Pencil size={14} /> এডিট</button><button type="button" className="text-button danger-text" disabled={busy || mode !== "database" || !!current.length} title={current.length ? "আগে চলমান অর্ডার শেষ করুন" : "টেবিল ডিলিট"} onClick={async () => {
          if (!window.confirm(`“${table.name}” (${table.id}) টেবিল ডিলিট করবেন? পুরোনো অর্ডারের হিসাব থাকবে; এই কোড আর ব্যবহার করা যাবে না।`)) return;
          if (await save({ ...data, tables: tables.filter((t) => t.id !== table.id) })) setNotice("টেবিল ডিলিট হয়েছে। পুরোনো অর্ডারের হিসাব থাকবে।");
        }}><Trash2 size={14} /> ডিলিট</button></>}</div>
      </article>;
    })}</div>
    {!tables.length && <p className="info-note">কোনো টেবিল নেই। নতুন টেবিল যোগ করুন এবং প্রয়োজন অনুযায়ী ওয়েটারকে বরাদ্দ দিন।</p>}
    {editing !== undefined && <SetupDialog title={editing ? "টেবিল এডিট" : "নতুন টেবিল"} busy={busy} close={close}><ResourceForm kind="table" value={editing || undefined} suggestedId={`T-${String(nextNumber).padStart(2, "0")}`} busy={busy} submit={async (entry) => {
      if (tables.some((t) => t.id !== editing?.id && (t.id === entry.id || t.name.toLowerCase() === entry.name.toLowerCase()))) { setNotice("এই কোড বা নামে টেবিল আছে। আলাদা কোড ও নাম দিন।"); return false; }
      const saved = await save({ ...data, tables: editing ? tables.map((t) => t.id === editing.id ? entry : t) : [...tables, entry] });
      if (saved) { close(); setNotice("টেবিল সেভ হয়েছে। নতুন টেবিল ওয়েটারকে Staff & permissions থেকে বরাদ্দ দিন।"); } return saved;
    }} /></SetupDialog>}
  </>;
}
