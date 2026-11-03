/* ── Component: AdminFooter ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";

export default function AdminFooter() {
  /* ────────── workspace state ────────── */
  const {} = useAdminContext();

  return (
    <footer className="page-footer">
      <span>© {new Date().getFullYear()} Alpine Restaurant</span>
      <span>
        <span className="signal" /> Crafted for better service
      </span>
    </footer>
  );
}
