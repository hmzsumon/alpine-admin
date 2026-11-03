/* ── Component: KitchenStationSummary ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { ArrowUpRight, Coffee, Flame, UtensilsCrossed } from "lucide-react";



export default function KitchenStationSummary() {
  /* ────────── workspace state ────────── */
  const { active, navigate, kitchens } = useAdminContext();

  return (
    <article className="panel station-panel">
      <div className="panel-title">
        <div>
          <h3>Kitchen stations</h3>
          <p>Orders in preparation</p>
        </div>
        <span className="live-chip">LIVE</span>
      </div>
      {kitchens.map((kitchen, i) => {
        const s = kitchen.id;
        const count = active.filter((o) =>
          o.items.some((it) => it.station === s)
        ).length;
        const Icon = [UtensilsCrossed, Flame, Coffee][i % 3];
        return (
          <div className="station-row" key={s}>
            <span className={`station-icon ${["green", "orange", "blue"][i % 3]}`}>
              <Icon size={20} />
            </span>
            <div>
              <strong>{kitchen.name}</strong>
              <small>{kitchen.floor}</small>
            </div>
            <div className="station-total">
              <strong>{String(count).padStart(2, "0")}</strong>
              <small>orders</small>
            </div>
          </div>
        );
      })}
      <button
        className="text-button station-link"
        onClick={() => navigate("Kitchen & KOT")}
      >
        View kitchen board <ArrowUpRight size={16} />
      </button>
    </article>
  );
}
