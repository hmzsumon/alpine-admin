/* ── Component: StaffDirectory ───────────────────────────────────────── */
"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import type { AuthUser, Permission, StaffRole } from "@/types/auth";
import StaffAccountForm from "./StaffAccountForm";
import StaffRoleManager from "./StaffRoleManager";
export default function StaffDirectory() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]), [roles, setRoles] = useState<StaffRole[]>([]), [permissions, setPermissions] = useState<Permission[]>([]), [editing, setEditing] = useState<AuthUser>(), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try {
    const [u, r] = await Promise.all([fetch("/api/users", { cache: "no-store" }), fetch("/api/roles", { cache: "no-store" })]);
    const [accounts, roleData] = await Promise.all([u.json(), r.json()]); if (!u.ok || !r.ok) throw new Error(accounts.error || roleData.error);
    setUsers(accounts.users); setRoles(roleData.roles); setPermissions(roleData.permissions);
  } catch (e) { setNotice(e instanceof Error ? e.message : "কর্মী লোড হয়নি"); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(path: string, body: unknown, method = "POST") {
    setBusy(true); setNotice(""); try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setNotice("সেভ হয়েছে। দায়িত্ব, রোল বা পাসওয়ার্ড বদলালে কর্মীকে আবার লগইন করতে হবে।"); await load(); return true;
    } catch (e) { setNotice(e instanceof Error ? e.message : "সেভ হয়নি"); return false; } finally { setBusy(false); }
  }
  return <>
    <p className="info-note">মোবাইল নম্বর দিয়ে কর্মীরা লগইন করবে। অপারেটরকে স্টেশন ও ওয়েটারকে টেবিল বরাদ্দ দিন। পুরনো হিসাব রাখতে কর্মী ডিলিটের বদলে নিষ্ক্রিয় করুন।</p>{notice && <p role="status" className="info-note">{notice}</p>}
    <section className="panel"><div className="panel-title"><h3>কর্মী ও দায়িত্ব</h3><span className="count-pill">{users.length}</span></div><div className="table-scroll"><table><thead><tr><th>কর্মী</th><th>মোবাইল / ইমেইল</th><th>রোল</th><th>স্টেশন / টেবিল</th><th>অবস্থা</th><th>অ্যাকশন</th></tr></thead><tbody>{users.map((staff) => <tr key={staff.id}><td>{staff.name}{staff.id === user.id ? " (আপনি)" : ""}</td><td>{staff.phone || "মোবাইল যোগ করুন"}<small className="staff-email">{staff.email}</small></td><td>{staff.roleName || staff.role}</td><td>{staff.stations?.join(", ") || "—"}<small className="staff-email">{staff.tables === undefined ? "আগের অ্যাকাউন্ট: সব টেবিল" : staff.tables.join(", ") || "কোনো টেবিল বরাদ্দ নেই"}</small></td><td><span className={"badge " + (staff.active ? "Ready" : "Cancelled")}>{staff.active ? "সক্রিয়" : "বন্ধ"}</span></td><td><div className="assignment-tools"><button className="secondary" disabled={busy} onClick={() => setEditing(staff)}>সম্পাদনা</button>{staff.role !== "owner" && <button className="secondary" disabled={busy} onClick={() => void save("/api/users/" + staff.id, { active: !staff.active }, "PATCH")}>{staff.active ? "নিষ্ক্রিয়" : "সক্রিয়"}</button>}</div></td></tr>)}</tbody></table></div></section>
    <div className="account-grid" style={{ marginTop: 22 }}><section className="panel account-card"><h3>{editing ? `${editing.name} — সম্পাদনা` : "নতুন কর্মী"}</h3><StaffAccountForm key={editing?.id || "new"} staff={editing} roles={roles} busy={busy} cancel={editing ? () => setEditing(undefined) : undefined} save={async (body) => { const ok = await save(editing ? "/api/users/" + editing.id : "/api/users", body, editing ? "PATCH" : "POST"); if (ok) setEditing(undefined); return ok; }} /></section>
    <section className="panel account-card"><h3>পাসওয়ার্ড রিসেট</h3><p>পুরনো সেশন বন্ধ হবে। নতুন পাসওয়ার্ড কর্মীকে দিন।</p><form onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const values = new FormData(form); if (await save("/api/users/" + values.get("id"), { password: values.get("password") }, "PATCH")) form.reset(); }}><label>কর্মী<select required name="id"><option value="">কর্মী বাছুন</option>{users.filter((s) => s.id !== user.id).map((s) => <option key={s.id} value={s.id}>{s.name} · {s.phone || s.email}</option>)}</select></label><label>নতুন পাসওয়ার্ড<input name="password" type="password" minLength={12} maxLength={72} required autoComplete="new-password" /></label><button className="primary" disabled={busy}>পাসওয়ার্ড রিসেট করুন</button></form></section></div>
    <div style={{ marginTop: 22 }}><StaffRoleManager roles={roles} permissions={permissions} busy={busy} save={(body, id) => save(id ? "/api/roles/" + id : "/api/roles", body, id ? "PATCH" : "POST")} /></div>
  </>;
}
