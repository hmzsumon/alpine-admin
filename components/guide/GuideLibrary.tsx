/* ── Component: GuideLibrary ─────────────────────────────────────────── */
"use client";
import { useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { guides, guideCategories } from "@/config/guides";
import GuideCard from "./GuideCard";

export default function GuideLibrary() {
  const [search, setSearch] = useState(""), [category, setCategory] = useState("সব বিষয়");
  const query = search.trim().toLocaleLowerCase();
  const visible = guides.filter((guide) => (category === "সব বিষয়" || category === guide.category) &&
    JSON.stringify(guide).toLocaleLowerCase().includes(query));
  return <div className="guide-workspace" lang="bn">
    <section className="guide-welcome">
      <span className="guide-welcome-icon"><BookOpen size={28} /></span>
      <div><span className="guide-kicker">ALPINE ব্যবহার সহায়িকা</span><h2>আপনার কাজ, সহজ ধাপে</h2><p>যে বিষয়টি শিখতে চান, তার কার্ডে চাপুন। প্রতিটি বিষয়ে কাজের নিয়ম, Alpine-এর উদাহরণ ও ভুল এড়ানোর পরামর্শ পাবেন।</p></div>
      <div className="guide-total"><strong>{guides.length.toLocaleString("bn-BD")}</strong><span>বিষয়ের নির্দেশিকা</span></div>
    </section>
    <div className="guide-search"><Search size={19} /><input aria-label="নির্দেশিকা খুঁজুন" placeholder="কী শিখতে চান? যেমন: ডাল, স্টক, পাসওয়ার্ড…" value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button type="button" aria-label="অনুসন্ধান মুছুন" onClick={() => setSearch("")}><X size={17} /></button>}</div>
    <div className="guide-categories" role="group" aria-label="বিষয়ের বিভাগ">{["সব বিষয়", ...guideCategories].map((name) => <button key={name} type="button" aria-pressed={category === name} className={category === name ? "is-active" : ""} onClick={() => setCategory(name)}>{name}</button>)}</div>
    <div className="guide-results" role="status">{visible.length.toLocaleString("bn-BD")}টি নির্দেশিকা <span>কাজের উদাহরণগুলো শেখার জন্য; এগুলো আসল অর্ডার বা স্টক পরিবর্তন করে না।</span></div>
    {visible.length ? <div className="guide-grid">{visible.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div> : <section className="guide-empty"><Search size={28} /><h3>এই বিষয়ে নির্দেশিকা পাওয়া যায়নি</h3><p>অন্য শব্দ দিয়ে খুঁজুন অথবা সব বিষয় দেখুন।</p><button type="button" className="secondary" onClick={() => { setSearch(""); setCategory("সব বিষয়"); }}>সব নির্দেশিকা দেখুন</button></section>}
  </div>;
}
