/* ── Component: WorkspaceBanner ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";

export default function WorkspaceBanner() {
  /* ────────── workspace state ────────── */
  const { mode } = useAdminContext();

  return (
    <div className={`mode-banner ${mode === "error" ? "error" : ""}`}>
      <span>
        <span className="signal" />
        {mode === "database"
          ? "MongoDB connected"
          : mode === "error"
          ? "API unavailable — changes disabled"
          : "Loading workspace…"}
      </span>
      <small>Authenticated access · Chowhatta, Sylhet-3100</small>
    </div>
  );
}
