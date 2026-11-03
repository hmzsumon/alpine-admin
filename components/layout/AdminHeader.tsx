/* ── Component: AdminHeader ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { Bell, ChevronRight, Menu } from "lucide-react";

export default function AdminHeader() {
  /* ────────── workspace state ────────── */
  const { page, data, setNotice, setDrawer, active } = useAdminContext();

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="mobile-toggle icon-button"
          aria-label="Open navigation"
          onClick={() => setDrawer(true)}
        >
          <Menu size={20} />
        </button>
        <span>Workspace</span>
        <ChevronRight size={13} />
        <strong>{page}</strong>
      </div>
      <div className="top-actions">
        <span className="branch-status">
          <span className="signal" /> Main branch
        </span>
        <span className="top-divider" />
        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={() =>
            setNotice(
              `${active.length} active orders. ${
                data.menu.filter((i) => i.price === null).length
              } items need prices.`
            )
          }
        >
          <Bell size={19} />
          <i />
        </button>
        <span className="avatar small">A</span>
      </div>
    </header>
  );
}
