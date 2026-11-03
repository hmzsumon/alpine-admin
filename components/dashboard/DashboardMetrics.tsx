/* ── Component: DashboardMetrics ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { CreditCard, ShoppingBag, Table2, Wallet } from "lucide-react";
import { money } from "@/utils/format";

export default function DashboardMetrics() {
  /* ────────── workspace state ────────── */
  const { range, active, paid, sales, expense } = useAdminContext();

  return (
    <section className="stats-grid">
      {[
        {
          label: "Total sales",
          value: money(sales),
          icon: Wallet,
          sub: `${paid.length} paid orders`,
          color: "green",
        },
        {
          label: "Active orders",
          value: String(active.length).padStart(2, "0"),
          icon: ShoppingBag,
          sub: "Across all kitchen stations",
          color: "blue",
        },
        {
          label: "Tables occupied",
          value: `${new Set(active.map((o) => o.table)).size} / 24`,
          icon: Table2,
          sub: "Ground & second floor",
          color: "purple",
        },
        {
          label: "Total expenses",
          value: money(expense),
          icon: CreditCard,
          sub: range === "Today" ? "Today's recorded expenses" : "Last 7 days",
          color: "orange",
        },
      ].map((s) => (
        <article className="stat-card" key={s.label}>
          <div className="stat-top">
            <span>{s.label}</span>
            <span className={`stat-icon ${s.color}`}>
              <s.icon size={19} />
            </span>
          </div>
          <h2>{s.value}</h2>
          <p>
            <span className={`mini-dot ${s.color}`} />
            {s.sub}
          </p>
        </article>
      ))}
    </section>
  );
}
