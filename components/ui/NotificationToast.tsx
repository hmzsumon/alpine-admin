/* ── Component: NotificationToast ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { Activity, X } from "lucide-react";

export default function NotificationToast() {
  /* ────────── workspace state ────────── */
  const { notice, setNotice } = useAdminContext();

  return (
    notice && (
      <div role="status" className="toast">
        <Activity size={18} />
        {notice}
        <button aria-label="Dismiss notification" onClick={() => setNotice("")}>
          <X size={16} />
        </button>
      </div>
    )
  );
}
