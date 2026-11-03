/* ── Component: CategoryManagement ───────────────────────────────────── */
"use client";
import { Trash2 } from "lucide-react";
import { useAdminContext } from "@/context/AdminContext";
import { useAuth } from "@/providers/AuthProvider";
export default function CategoryManagement() {
  const { data, categories, save, busy, mode, setNotice, category, setCategory } = useAdminContext();
  const { can } = useAuth();
  return <details className="category-management"><summary>ক্যাটাগরি পরিচালনা <span className="count-pill">{categories.length}</span></summary><p className="muted">ক্যাটাগরি ডিলিট করতে তার আইটেমগুলো আগে অন্য ক্যাটাগরিতে নিন বা ডিলিট করুন।</p><div className="category-chip-grid">{categories.map((name) => {
    const count = data.menu.filter((m) => m.category.toLowerCase() === name.toLowerCase()).length;
    return <div className="category-manage-chip" key={name}><span>{name}<small>{count}টি আইটেম</small></span>{can("menu:manage") && <button type="button" className="icon-button danger-text" aria-label={`${name} ক্যাটাগরি ডিলিট`} disabled={busy || mode !== "database"} onClick={async () => {
      if (count) { setNotice("এই ক্যাটাগরিতে আইটেম আছে। আগে অন্য ক্যাটাগরিতে নিন বা ডিলিট করুন।"); return; }
      if (!window.confirm(`“${name}” ক্যাটাগরি ডিলিট করবেন?`)) return;
      if (await save({ ...data, categories: categories.filter((c) => c.toLowerCase() !== name.toLowerCase()) })) { if (category === name) setCategory("All categories"); setNotice("ক্যাটাগরি ডিলিট হয়েছে।"); }
    }}><Trash2 size={16} /></button>}</div>;
  })}</div></details>;
}
