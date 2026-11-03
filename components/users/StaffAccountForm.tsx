/* ── Component: StaffAccountForm ─────────────────────────────────────── */
"use client";
import { useState } from "react";
import type { AuthUser, StaffRole } from "@/types/auth";
import { useAdminContext } from "@/context/AdminContext";
import AssignmentPicker from "./AssignmentPicker";
export default function StaffAccountForm({ staff, roles, busy, save, cancel }: { staff?: AuthUser; roles: StaffRole[]; busy: boolean; save: (body: unknown) => Promise<boolean>; cancel?: () => void }) {
  const { tables: restaurantTables, kitchens } = useAdminContext();
  const [stations, setStations] = useState(staff?.stations || []);
  const [tables, setTables] = useState(staff?.tables || (staff ? restaurantTables.map((t) => t.id) : []));
  return <form onSubmit={async (event) => {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    const body: Record<string, unknown> = { ...values, stations: stations.filter((id) => kitchens.some((k) => k.id === id)), tables: tables.filter((id) => restaurantTables.some((t) => t.id === id)) }; if (staff && !values.password) delete body.password;
    if (await save(body)) { if (!staff) { form.reset(); setStations([]); setTables([]); } }
  }}>
    <label>কর্মীর নাম<input name="name" required minLength={2} maxLength={80} defaultValue={staff?.name} /></label>
    <label>মোবাইল নম্বর — লগইন আইডি<input name="phone" type="tel" required autoComplete="off" placeholder="01712345678" defaultValue={staff?.phone} /></label>
    {!staff && <label>ইমেইল (ঐচ্ছিক)<input name="email" type="email" autoComplete="off" /></label>}
    <label>রোল<select name="role" defaultValue={staff?.roleId || staff?.role || "waiter"}>{roles.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name}{r.builtin ? "" : " · Custom"}</option>)}</select></label>
    <label>{staff ? "নতুন পাসওয়ার্ড (বদলাতে চাইলে দিন)" : "পাসওয়ার্ড"}<input name="password" type="password" required={!staff} minLength={12} maxLength={72} autoComplete="new-password" /></label>
    <AssignmentPicker selectedStations={stations} tables={tables} onStations={setStations} onTables={setTables} />
    <div className="assignment-tools"><button className="primary" disabled={busy}>{staff ? "পরিবর্তন সেভ করুন" : "কর্মী তৈরি করুন"}</button>{cancel && <button type="button" className="secondary" onClick={cancel}>বন্ধ করুন</button>}</div>
  </form>;
}
