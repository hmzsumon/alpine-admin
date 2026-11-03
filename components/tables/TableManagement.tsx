/* ── Component: TableManagement ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Plus, Table2 } from "lucide-react";
import { money, total } from "@/utils/format";

export default function TableManagement() {
  const { can } = useAuth();
  /* ────────── workspace state ────────── */
  const { floor, setFloor, active, openOrder } = useAdminContext();

  return (
    <>
      <div className="filters floor-filters">
        {["All floors", "Ground floor", "Second floor"].map((f) => (
          <button
            key={f}
            className={floor === f ? "primary" : "secondary"}
            onClick={() => setFloor(f)}
          >
            {f}
          </button>
        ))}
        <span className="muted">24 tables · 12 on each floor</span>
      </div>
      <div className="table-grid">
        {Array.from({ length: 24 }, (_, i) => {
          const id = `T-${String(i + 1).padStart(2, "0")}`;
          const f = i < 12 ? "Ground floor" : "Second floor";
          if (floor !== "All floors" && floor !== f) return null;
          const current = active.filter((o) => o.table === id);
          return (
            <button
              key={id}
              className={`table-card ${current.length ? "occupied" : ""}`}
              disabled={!can("orders:create")}
              onClick={() => openOrder(id)}
            >
              <div>
                <Table2 size={23} />
                <span
                  className={`badge ${current.length ? "Preparing" : "Ready"}`}
                >
                  {current.length ? "Occupied" : "Available"}
                </span>
              </div>
              <h3>{id}</h3>
              <p>{f} · 4 seats</p>
              <footer>
                {current.length
                  ? `${current.length} orders · ${money(
                      current.reduce((s, o) => s + total(o), 0)
                    )}`
                  : "Tap to start an order"}
                <Plus size={15} />
              </footer>
            </button>
          );
        })}
      </div>
    </>
  );
}
