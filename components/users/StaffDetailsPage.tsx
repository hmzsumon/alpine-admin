/* ── Component: individual employee profile and date-filtered performance ── */
"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, UserRound } from "lucide-react";
import type { StaffDetails } from "@/types/staff-shifts";
import { money } from "@/utils/format";
import StaffShiftAssignment,{dhakaToday} from "./StaffShiftAssignment";
import StaffPerformanceTables from "./StaffPerformanceTables";
import "./staff-shifts.css";
export default function StaffDetailsPage({id}:{id:string}) {
  const [from,setFrom]=useState(()=>dhakaToday().slice(0,8)+"01"),[to,setTo]=useState(dhakaToday),[data,setData]=useState<StaffDetails>(),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const sequence=useRef(0);
  const load=useCallback(async()=>{const run=++sequence.current;setBusy(true);setError("");try{const r=await fetch(`/api/users/${id}/details?`+new URLSearchParams({from,to}),{cache:"no-store"});const result=await r.json();if(!r.ok)throw Error(result.error);if(run===sequence.current)setData(result);}catch(e){if(run===sequence.current)setError(e instanceof Error?e.message:"তথ্য লোড হয়নি");}finally{if(run===sequence.current)setBusy(false);}},[id,from,to]);
  useEffect(()=>{void load();return()=>{sequence.current++;};},[load]);
  return <div className="staff-details-page"><Link href="/users" className="staff-back"><ArrowLeft size={17}/>কর্মীদের তালিকায় ফিরুন</Link>
    <section className="panel staff-profile"><div className="staff-avatar"><UserRound size={30}/></div><div><p className="muted">কর্মীর বিস্তারিত</p><h1>{data?.user.name||"তথ্য লোড হচ্ছে…"}</h1><p>{data?.user.phone||data?.user.email}</p><p className="muted">{data?.user.roleName||data?.user.role} · {data?.user.active?"সক্রিয়":"নিষ্ক্রিয়"}</p></div><button className="secondary" type="button" disabled={busy} onClick={()=>void load()}><RefreshCw size={16}/>রিফ্রেশ</button></section>
    <div className="panel staff-filter"><label>শুরু<input type="date" required value={from} max={to} onChange={e=>{if(e.target.value)setFrom(e.target.value);}}/></label><label>শেষ<input type="date" required value={to} min={from} onChange={e=>{if(e.target.value)setTo(e.target.value);}}/></label><p>বাংলাদেশ সময় অনুযায়ী হিসাব। {busy?"লোড হচ্ছে…":"সর্বশেষ রিপোর্ট"}</p></div>
    {error&&<p role="alert" className="info-note">{error}</p>}
    {data&&!error&&<><div className="staff-metric-grid" aria-busy={busy}>{[
      ["নেওয়া অর্ডার",data.totals.orders+"টি"],["বাতিল বাদে অর্ডারের মূল্য",money(data.totals.sales)],["বিক্রির খাবার",data.totals.items+"টি"],["নিজের অর্ডারে পরিশোধিত",money(data.totals.paidOwnSales)],
      ["নিজে টাকা গ্রহণ করেছেন",money(data.totals.collected)],["পেমেন্ট গ্রহণ",data.totals.paymentCount+"টি বিল"],["খাবার প্রস্তুত নিশ্চিত",data.totals.readyUnits+"টি"],["সার্ভ / হস্তান্তর নিশ্চিত",data.totals.servedUnits+"টি"],
    ].map(([label,value])=><div key={label} className="panel staff-metric"><small>{label}</small><strong>{value}</strong></div>)}</div>
      <p className="info-note">বিক্রির পরিমাণ হলো এই কর্মীর তৈরি করা অর্ডারের বর্তমান মোট মূল্য; বাতিল অর্ডার ({data.totals.cancelled}টি) বাদ। টাকা গ্রহণ আলাদা হিসাব—দুটো যোগ করবেন না। শিফট হলো নির্ধারিত ডিউটি; উপস্থিতি বা সময়মতো আসার প্রমাণ নয়। ডিলিট করা অর্ডার এই রিপোর্টে থাকে না।</p>
      {!!data.legacyUnattributedOrders&&<p className="info-note">পুরোনো {data.legacyUnattributedOrders}টি অর্ডারে একই নাম থাকলেও কর্মীর নির্দিষ্ট আইডি নেই, তাই অনুমান করে এই রিপোর্টে যোগ করা হয়নি। ডিলিট করা অর্ডার এই রিপোর্টে থাকে না।</p>}
      <section className="panel staff-report-panel"><h3>দায়িত্ব ও অ্যাক্সেস</h3><p>স্টেশন: {data.user.stations?.join(", ")||"বরাদ্দ নেই"}</p><p>টেবিল: {data.user.tables===undefined?"পুরোনো অ্যাকাউন্ট: সব টেবিল":data.user.tables.join(", ")||"বরাদ্দ নেই"}</p><details><summary>অনুমতির তালিকা</summary><p className="muted">{data.user.permissions.join(" · ")}</p></details></section>
      <StaffShiftAssignment key={data.user.id} data={data} reload={load}/><StaffPerformanceTables data={data}/>
    </>}
  </div>;
}
