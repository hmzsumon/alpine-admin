/* ── Component: AdminPageHeader ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Plus } from "lucide-react";
import { heading } from "@/config/admin";

export default function AdminPageHeader() {
  const { can } = useAuth();
  /* ────────── workspace state ────────── */
  const { page, mode, range, setRange, busy, openOrder } = useAdminContext();

  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          ALPINE RESTAURANT <span>/</span> OPERATIONS
        </div>
        <h1>{page === "Overview" ? "Overview" : page}</h1>
        <p>{heading[page]}</p>
      </div>
      {page !== "নির্দেশিকা" && page !== "ক্রয় ও স্টোর" && <div className="heading-actions">
        <select
          aria-label="Reporting period"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option>Today</option>
          <option>Last 7 days</option>
        </select>
        <button
          className="primary"
          disabled={
            !can("orders:create") ||
            busy ||
            mode === "loading" ||
            mode === "error"
          }
          onClick={() => openOrder()}
        >
          <Plus size={17} /> New order
        </button>
      </div>}
    </div>
  );
}
