/* ── Component: Empty ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { ShoppingBag } from "lucide-react";

export default function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <span>
        <ShoppingBag size={25} />
      </span>
      <strong>{text}</strong>
      <small>Your workspace updates as you start recording activity.</small>
    </div>
  );
}
