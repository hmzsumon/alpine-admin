/* ── Component: GuideCard ────────────────────────────────────────────── */
import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
import type { Guide } from "@/config/guides";

export default function GuideCard({ guide }: { guide: Guide }) {
  return <Link href={`/guide/${guide.slug}`} className="guide-card">
    <div className="guide-card-top"><span className="guide-card-icon"><BookOpen size={21} /></span><span className="guide-category">{guide.category}</span></div>
    <h3>{guide.title}</h3><p>{guide.summary}</p>
    <div className="guide-card-footer"><span><CheckCircle2 size={14} /> ধাপ ও উদাহরণসহ</span><ArrowUpRight size={19} /></div>
  </Link>;
}
