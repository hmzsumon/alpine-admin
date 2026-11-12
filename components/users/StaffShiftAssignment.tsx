/* ── Component: dated schedule changes with preserved history ── */
"use client";
import { useState } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import type { StaffDetails } from "@/types/staff-shifts";
export const dhakaToday=()=>new Date(Date.now()+6*3600000).toISOString().slice(0,10);
export default function StaffShiftAssignment({data,reload}:{data:StaffDetails;reload:()=>Promise<void>}) {
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState("");
  const today=dhakaToday(),current=data.schedule.entries.find(e=>!e.supersededAt&&e.from<=today&&(!e.to||e.to>=today));
  return <section className="panel account-card staff-shifts-panel"><h3>শিফট বরাদ্দ / পরিবর্তন</h3><p className="info-note">আজকের বরাদ্দ: <strong>{current?current.name:"এখনো দেওয়া হয়নি"}</strong>{current?.start&&` · ${current.start} – ${current.end}`}</p>
    <p className="muted">নিচের তারিখ থেকে নতুন শিফট চলবে। আগের সময়ের হিসাব থাকবে। ওই তারিখের পর আগে দেওয়া কোনো ভবিষ্যৎ বরাদ্দ থাকলে সেটিও এই নতুন বরাদ্দ দিয়ে প্রতিস্থাপিত হবে।</p>
    {notice&&<p className="info-note" role="status">{notice}</p>}
    <form onSubmit={async e=>{e.preventDefault();const values=new FormData(e.currentTarget);setBusy(true);setNotice("");try{const r=await fetch(`/api/users/${data.user.id}/shift`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({shiftId:values.get("shiftId")==="__leave__"?"":values.get("shiftId"),from:values.get("from"),revision:data.schedule.revision})});const result=await r.json();if(!r.ok)throw Error(result.error);await reload();setNotice("নতুন শিফট বরাদ্দ সেভ হয়েছে।");}catch(e){setNotice(e instanceof Error?e.message:"সেভ হয়নি");}finally{setBusy(false);}}}>
      <div className="shift-form-grid"><label>শিফট<SearchableSelect required name="shiftId" defaultValue={current?.shiftId||(current?"__leave__":"")}><option value="" disabled>শিফট বাছুন</option><option value="__leave__">ছুটি / শিফট বন্ধ</option>{data.shifts.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name} · {s.start} – {s.end}</option>)}</SearchableSelect></label><label>কবে থেকে?<input name="from" type="date" required min={today} defaultValue={today}/></label></div><button className="primary" disabled={busy}>{busy?"সেভ হচ্ছে…":"বরাদ্দ নিশ্চিত করুন"}</button>
    </form>
    <details className="staff-history"><summary>সব বরাদ্দের ইতিহাস ({data.schedule.entries.length})</summary><div className="table-scroll"><table><thead><tr><th>শিফট</th><th>সময়</th><th>কার্যকর তারিখ</th><th>বরাদ্দ দিয়েছেন</th></tr></thead><tbody>{[...data.schedule.entries].reverse().map(entry=><tr key={entry.id}><td>{entry.name}{entry.supersededAt&&<small className="item-note">প্রতিস্থাপিত বরাদ্দ</small>}</td><td>{entry.start?`${entry.start} – ${entry.end}`:"ছুটি"}</td><td>{entry.from} → {entry.to||"পরবর্তী পরিবর্তন পর্যন্ত"}</td><td>{entry.assignedBy}<small className="item-note">{new Date(entry.assignedAt).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka"})}</small></td></tr>)}</tbody></table></div></details>
  </section>;
}
