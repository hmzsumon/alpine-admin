/* ── Component: GuideArticle ─────────────────────────────────────────── */
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, Users } from "lucide-react";
import { guides, type Guide } from "@/config/guides";
import GuideCard from "./GuideCard";

export default function GuideArticle({ guide }: { guide: Guide }) {
  const related = guide.related.map((slug) => guides.find((item) => item.slug === slug)).filter((item): item is Guide => Boolean(item));
  return <div className="guide-workspace" lang="bn">
    <Link href="/guide" className="guide-back"><ArrowLeft size={17} /> সব নির্দেশিকা</Link>
    <article className="guide-article">
      <header className="guide-article-header"><span className="guide-category"><BookOpen size={15} /> {guide.category}</span><h2>{guide.title}</h2><p>{guide.summary}</p><span className="guide-audience"><Users size={16} /> কাদের জন্য: {guide.audience}</span></header>
      <div className="guide-article-body">
        <section aria-labelledby="guide-steps"><h3 id="guide-steps">যেভাবে কাজটি করবেন</h3><ol className="guide-steps">{guide.steps.map((step, index) => <li key={step}><span aria-hidden="true">{(index + 1).toLocaleString("bn-BD")}</span><p>{step}</p></li>)}</ol></section>
        <section className="guide-example" aria-labelledby="guide-example-title"><div className="guide-example-label"><Lightbulb size={19} /> হাতে-কলমে উদাহরণ</div><h3 id="guide-example-title">{guide.example.title}</h3><ol>{guide.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="guide-outcome"><CheckCircle2 size={20} /><p><strong>ফলাফল</strong>{guide.example.result}</p></div></section>
        <section className="guide-tips" aria-labelledby="guide-tips-title"><h3 id="guide-tips-title">মনে রাখবেন / ভুল হলে করণীয়</h3><ul>{guide.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section>
      </div>
    </article>
    {!!related.length && <section className="guide-related"><h2>এর সঙ্গে আরও শিখুন</h2><div className="guide-grid">{related.map((item) => <GuideCard key={item.slug} guide={item} />)}</div></section>}
    <Link href="/guide" className="guide-back"><ArrowLeft size={17} /> সব নির্দেশিকায় ফিরে যান</Link>
  </div>;
}
