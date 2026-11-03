/* ── Component: AdminSidebar ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { canAccessPath } from "@/config/access";
import { LogOut } from "lucide-react";
import { navigation } from "@/config/admin";

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  /* ────────── workspace state ────────── */
  const { page, setNotice, drawer, active, navigate } = useAdminContext();

  return (
    <aside className={`sidebar ${drawer ? "open" : ""}`}>
      <a className="brand" href="/" aria-label="Alpine home">
        <span className="brand-mark">
          <UtensilsCrossed size={23} />
        </span>
        <span>
          ALPINE<small>RESTAURANT</small>
        </span>
      </a>
      <div className="location">
        <span className="location-icon">
          <UtensilsCrossed size={17} />
        </span>
        <div>
          Chowhatta, Sylhet<small>Main branch</small>
        </div>
        <ChevronDown size={14} />
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        {navigation
          .filter((n) => canAccessPath(user, n.href))
          .map((n) => (
            <button
              key={n.name}
              className={page === n.name ? "selected" : ""}
              onClick={() => navigate(n.name)}
            >
              <n.icon size={19} />
              {n.name}
              {n.name === "Orders" && (
                <span className="nav-count">{active.length}</span>
              )}
            </button>
          ))}
      </nav>
      <div className="sidebar-note">
        <span className="signal" /> THREE KITCHEN STATIONS
        <p>
          One connected restaurant.
          <br />
          From order to service.
        </p>
        <button
          onClick={() =>
            navigate(
              user.permissions.includes("printers:read")
                ? "Printers"
                : "Kitchen & KOT"
            )
          }
        >
          Manage stations <ArrowUpRight size={15} />
        </button>
      </div>
      <button
        className="help-link"
        onClick={() =>
          setNotice(
            "Setup guide: see alpine-admin/README.md. Printer addresses must be configured on site."
          )
        }
      >
        <CircleHelp size={18} /> Help & setup guide
      </button>
      <div className="profile">
        <span className="avatar">A</span>
        <div>
          {user.name}
          <small>{user.role}</small>
        </div>
        <button className="icon-button" aria-label="Sign out" onClick={logout}>
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
