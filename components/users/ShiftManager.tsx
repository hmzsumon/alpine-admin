/* ── Component: editable shift templates, with revision protection ── */
"use client";
import { useEffect, useState } from "react";
import { Clock3, Pencil, Plus } from "lucide-react";
import type { StaffShift } from "@/types/staff-shifts";
import "./staff-shifts.css";
export default function ShiftManager() {
  const [shifts,setShifts]=useState<StaffShift[]>([]),[editing,setEditing]=useState<StaffShift>(),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
  useEffect(()=>{const controller=new AbortController();fetch("/api/users/shifts",{cache:"no-store",signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error);setShifts(data.shifts);}).catch(e=>{if(e.name!=="AbortError")setNotice(e.message);});return()=>controller.abort();},[]);
  return <section className="panel account-card staff-shifts-panel"><div className="panel-title"><h3><Clock3 size={20}/>ডিউটির শিফট</h3><span className="count-pill">{shifts.length}টি</span></div>
    <p className="muted">শিফটের নাম ও সময় পরিবর্তন করা যাবে। সময় বদলালে আগের কর্মী বরাদ্দের সময় বদলাবে না; কর্মীর বিস্তারিত পেজে নতুন করে বরাদ্দ দিন।</p>
    {notice&&<p className="info-note" role="status">{notice}</p>}
    <div className="shift-template-grid">{shifts.map(shift=><div key={shift.id} className="shift-template"><strong>{shift.name}</strong><p>{shift.start} – {shift.end}{shift.start>shift.end?" (পরদিন শেষ)":""}</p><small>{shift.active?"সক্রিয়":"নতুন বরাদ্দ বন্ধ"}</small><button type="button" className="secondary" onClick={()=>{setEditing(shift);setNotice("");}}><Pencil size={14}/>সম্পাদনা</button></div>)}</div>
    <form key={editing?.id||"new"} className="shift-template-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget,values=new FormData(form);setBusy(true);setNotice("");try{const r=await fetch("/api/users/shifts"+(editing?"/"+encodeURIComponent(editing.id):""),{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:values.get("name"),start:values.get("start"),end:values.get("end"),active:values.get("active")==="on",...(editing?{version:editing.version}:{})})});const result=await r.json();if(!r.ok)throw Error(result.error);setShifts(result.shifts);setEditing(undefined);form.reset();setNotice("শিফট সেভ হয়েছে। কর্মীর বিস্তারিত পেজ থেকে বরাদ্দ করুন।");}catch(e){setNotice(e instanceof Error?e.message:"সেভ হয়নি");}finally{setBusy(false);}}}>
      <h4>{editing?"শিফট সম্পাদনা":"নতুন শিফট"}</h4><div className="shift-form-grid"><label>শিফটের নাম<input required minLength={2} maxLength={80} name="name" defaultValue={editing?.name} placeholder="যেমন: রাতের শিফট"/></label><label>শুরু<input required name="start" type="time" defaultValue={editing?.start||"08:00"}/></label><label>শেষ<input required name="end" type="time" defaultValue={editing?.end||"16:00"}/></label></div>
      <label className="check-label"><input type="checkbox" name="active" defaultChecked={editing?.active??true}/>নতুন কর্মী বরাদ্দের জন্য সক্রিয়</label>
      <div className="assignment-tools"><button className="primary" disabled={busy}><Plus size={15}/>{busy?"সেভ হচ্ছে…":"শিফট সেভ করুন"}</button>{editing&&<button type="button" className="secondary" onClick={()=>setEditing(undefined)}>নতুন শিফট তৈরি</button>}</div>
    </form>
  </section>;
}
