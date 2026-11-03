/* ── Component: KitchenStationSummary ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { ArrowUpRight, Coffee, Flame, UtensilsCrossed } from "lucide-react";

import { stations } from "@/config/admin";

export default function KitchenStationSummary() {
  /* ────────── workspace state ────────── */
  const { active, navigate } = useAdminContext();

  return (
    <article className="panel station-panel">
      <div className="panel-title">
        <div>
          <h3>Kitchen stations</h3>
          <p>Orders in preparation</p>
        </div>
        <span className="live-chip">LIVE</span>
      </div>
      {stations.map((s, i) => {
        const count = active.filter((o) =>
          o.items.some((it) => it.station === s)
        ).length;
        const Icon = [UtensilsCrossed, Flame, Coffee][i];
        return (
          <div className="station-row" key={s}>
            <span className={`station-icon ${["green", "orange", "blue"][i]}`}>
              <Icon size={20} />
            </span>
            <div>
              <strong>{s}</strong>
              <small>{i === 0 ? "Ground floor" : "Second floor"}</small>
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
