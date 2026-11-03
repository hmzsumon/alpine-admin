/* ── Component: MenuReadinessSummary ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { ArrowUpRight, BookOpen, UtensilsCrossed } from "lucide-react";

export default function MenuReadinessSummary() {
  /* ────────── workspace state ────────── */
  const { data, categories, navigate } = useAdminContext();

  return (
    <section className="bottom-grid">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h3>Menu readiness</h3>
            <p>Keep your service running smoothly</p>
          </div>
          <BookOpen size={20} className="muted" />
        </div>
        <div className="readiness">
          <div>
            <strong>{data.menu.filter((i) => i.active).length}</strong>
            <span>Available items</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>Categories</span>
          </div>
          <div>
            <strong className="amber-text">
              {data.menu.filter((i) => i.price === null).length}
            </strong>
            <span>Prices to confirm</span>
          </div>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("Menu & categories")}
        >
          Manage your menu <ArrowUpRight size={16} />
        </button>
      </article>
      <article className="welcome-card">
        <div className="welcome-symbol">
          <UtensilsCrossed size={32} />
        </div>
        <div>
          <span className="eyebrow">BUILT FOR YOUR RESTAURANT</span>
          <h3>
            Great service starts
            <br />
            behind the scenes.
          </h3>
          <p>Three stations. Two floors. One Alpine.</p>
          <button onClick={() => navigate("Printers")}>
            Set up kitchen routing <ArrowUpRight size={16} />
          </button>
        </div>
      </article>
    </section>
  );
}
