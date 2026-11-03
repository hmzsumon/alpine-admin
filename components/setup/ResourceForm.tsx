/* ── Component: ResourceForm; routing codes remain immutable ───────────── */
"use client";
import { useState } from "react";
import type { RestaurantTable, Kitchen } from "@/types";
export default function ResourceForm({ kind, value, suggestedId, busy, submit }: { kind: "table" | "kitchen"; value?: RestaurantTable | Kitchen; suggestedId: string; busy: boolean; submit: (entry: RestaurantTable) => Promise<boolean> }) {
  const [error, setError] = useState("");
  return <form onSubmit={async (e) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const id = String(f.get("id")).trim(), name = String(f.get("name")).trim(), floor = String(f.get("floor")).trim();
    if (!name || !floor || (kind === "table" ? !/^T-(0[1-9]|[1-9]\d{1,3})$/.test(id) : !id || id === "Cash Counter" || /[\u0000-\u001f:]/.test(id))) { setError("সঠিক কোড, নাম ও ফ্লোর দিন। টেবিল কোডের উদাহরণ T-25।"); return; }
    setError(""); if (!await submit({ id, name, floor, seats: kind === "table" ? Number(f.get("seats")) : 4 })) setError("সেভ হয়নি। প্যানেলের ত্রুটির বার্তা দেখুন এবং প্রয়োজন হলে তালিকা রিফ্রেশ করুন।");
  }}>
    <label>{kind === "table" ? "টেবিল কোড" : "কিচেন কোড"} *<input name="id" required maxLength={80} readOnly={!!value} defaultValue={value?.id || suggestedId} /></label>
    <small className="item-note">কোড অর্ডার ও দায়িত্বের সঙ্গে যুক্ত, তাই তৈরি করার পর কোড বদলায় না। নাম পরিবর্তন করতে পারবেন। ডিলিট করা কোড পুনরায় ব্যবহার করা যাবে না।</small>
    <label>{kind === "table" ? "টেবিলের নাম" : "কিচেনের নাম"} *<input name="name" required maxLength={80} defaultValue={value?.name || (kind === "table" ? suggestedId : "")} placeholder={kind === "table" ? "যেমন: জানালার পাশের টেবিল" : "যেমন: Pizza Kitchen"} /></label>
    <label>ফ্লোর *<select name="floor" defaultValue={value?.floor || "Ground floor"}><option value="Ground floor">নিচতলা — Ground floor</option><option value="Second floor">দ্বিতীয় তলা — Second floor</option>{value?.floor && !["Ground floor", "Second floor"].includes(value.floor) && <option>{value.floor}</option>}</select></label>
    {kind === "table" && <label>আসন সংখ্যা *<input name="seats" type="number" required min={1} max={100} step={1} defaultValue={value && "seats" in value ? value.seats : 4} /></label>}
    {error && <p role="alert" className="form-error">{error}</p>}<button type="submit" className="primary" disabled={busy}>{busy ? "সেভ হচ্ছে…" : "সেভ করুন"}</button>
  </form>;
}
