/* ────────── authenticated guide detail; unknown topics return 404 ────────── */
import { notFound } from "next/navigation";
import GuideArticle from "@/components/guide/GuideArticle";
import { guides } from "@/config/guides";
export default function Page({ params }: { params: { slug: string } }) {
  const guide = guides.find((item) => item.slug === params.slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}
