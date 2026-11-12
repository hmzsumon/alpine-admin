/* ── Components: readable unit presets without renaming existing stock balances ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useState } from "react";
const units = [
  { value: "portion", label: "পোরশন / পরিবেশন" },
  { value: "piece", label: "পিস" },
  { value: "half", label: "হাফ বাটি / হাফ অংশ" },
  { value: "plate", label: "প্লেট" },
  { value: "bowl", label: "বাটি" },
  { value: "glass", label: "গ্লাস" },
  { value: "cup", label: "কাপ" },
  { value: "bottle", label: "বোতল" },
  { value: "pack", label: "প্যাকেট" },
  { value: "half grill", label: "হাফ গ্রিল" },
];
export function StockUnitField({ initial = "portion" }: { initial?: string }) {
  const existing = units.some((u) => u.value === initial),
    [selected, setSelected] = useState(existing ? initial : "custom"),
    [custom, setCustom] = useState(existing ? "" : initial);
  return (
    <div>
      <label>
        Stock unit * — কোন মাপে গুনবেন?
        <SearchableSelect value={selected} onChange={(e) => setSelected(e.target.value)}>
          {units.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
          <option value="custom">অন্যান্য / আগের নিজস্ব একক</option>
        </SearchableSelect>
      </label>
      {selected === "custom" && (
        <label>
          নিজস্ব একক *
          <input
            required
            maxLength={30}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="এককের নাম লিখুন"
          />
        </label>
      )}
      <input
        type="hidden"
        name="unit"
        value={selected === "custom" ? custom.trim() : selected}
      />
    </div>
  );
}
const counts = [1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24, 30, 50, 100];
export function StockUnitsPerItem({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  name: string;
}) {
  const [custom, setCustom] = useState(!counts.includes(value));
  return (
    <label>
      Units per item — এক আইটেমে কত ইউনিট?
      <SearchableSelect
        aria-label={"Stock units for " + name}
        value={custom ? "custom" : value}
        onChange={(e) => {
          setCustom(e.target.value === "custom");
          if (e.target.value !== "custom") onChange(Number(e.target.value));
        }}
      >
        {counts.map((n) => (
          <option key={n} value={n}>
            {n.toLocaleString("bn-BD")} ইউনিট
          </option>
        ))}
        <option value="custom">অন্য পরিমাণ</option>
      </SearchableSelect>
      {custom && (
        <input
          aria-label={name + " নিজস্ব ইউনিট সংখ্যা"}
          type="number"
          min={1}
          max={1000}
          required
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </label>
  );
}
