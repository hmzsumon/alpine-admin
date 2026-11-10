/* ── Component: DeveloperSeedCard; repeatable, additive seed, separate from destructive reset ── */
"use client";
import { Sprout } from "lucide-react";
export interface SeedInfo { items:number;excelItems:number;kitchens:number;tables:number;printers:number; }
export default function DeveloperSeedCard({info,busy,disabled,seed}:{info:SeedInfo;busy:boolean;disabled:boolean;seed:()=>void}){
 return <section className="dev-card"><h2><Sprout size={20}/>প্রাথমিক সিড ডেটা</h2><p>এক ক্লিকে আপনার Excel ও প্রাইসের তালিকা মিলিয়ে মেনু, বাংলা–ইংরেজি নাম, ইউনিক কোড ও কিচেন সেটআপ তৈরি করুন।</p>
 <p><strong>{info.items.toLocaleString("bn-BD")}টি মেনু আইটেম</strong> — Excel-এর {info.excelItems.toLocaleString("bn-BD")}টি আইটেমসহ প্রাইসের তালিকার নতুন খাবার। সঙ্গে {info.kitchens.toLocaleString("bn-BD")}টি কিচেন, {info.tables.toLocaleString("bn-BD")}টি টেবিল এবং {info.printers.toLocaleString("bn-BD")}টি প্রিন্টার স্লটের প্রাথমিক সেটআপ।</p>
 <p className="info-note">Main Kitchen নিচতলায়; BBQ ও Drinks দ্বিতীয় তলায়। নতুন প্রিন্টার সেটআপ বন্ধ থাকবে; পরে IP বসিয়ে চালু করবেন। দাম জানা নেই এমন নতুন খাবার বিক্রি বন্ধ থাকবে। Firni-এর কোড ১৭২, Normal Faluda-এর ৩৫।</p>
 <p>আগে থাকা দাম, ছবি, কর্মী, অর্ডার ও স্টকের হিসাব থাকবে। আবার চাপলে ডাবল হবে না। কোডে দ্বন্দ্ব হলে আগে সেটি ঠিক করতে বলবে। বাস্তবে খাবার গুনে ওপেনিং দেবেন; এখানে স্টকের সংখ্যা বানানো হবে না।</p>
 <p className="muted">সেভের আগে encrypted backup হবে। কয়েক মুহূর্ত অ্যাপের নতুন কাজ থামিয়ে কাজ শেষে আগের maintenance অবস্থা ফিরবে। অ্যাকাউন্ট বা পাসওয়ার্ড তৈরি/পরিবর্তন হবে না।</p>
 <button className="primary" disabled={disabled} onClick={seed}><Sprout size={17}/>{busy?"ব্যাকআপসহ সিড তৈরি হচ্ছে…":"প্রাথমিক সিড ডেটা তৈরি করুন"}</button></section>;
}
