/* ── Component: SearchBox ────────────────────────────────────────────── */
"use client";
/* ────────── imports ────────── */
import { Search } from "lucide-react";

export default function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        aria-label="Search"
        placeholder="Search anything…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
