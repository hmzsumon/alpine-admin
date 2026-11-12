/* ── Component: choose multiple supply categories without typing comma-separated names ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useState } from "react";
import { X } from "lucide-react";
const categories = [
  "মাছ",
  "মাংস",
  "মুরগি",
  "সবজি",
  "মসলা",
  "মুদি",
  "ফল",
  "দুধ ও দুগ্ধজাত পণ্য",
  "পানীয়",
  "প্যাকেজিং সামগ্রী",
  "পরিষ্কার-পরিচ্ছন্নতার সামগ্রী",
  "অন্যান্য",
];
export default function SupplierKindsField({
  initial = [],
}: {
  initial?: string[];
}) {
  // Keep existing custom category labels editable instead of silently dropping old data.
  const [selected, setSelected] = useState(() => [
    ...new Set(initial.map((v) => v.trim()).filter(Boolean)),
  ]);
  const options = [...new Set([...categories, ...selected])];
  return (
    <div>
      <label>
        কোন মাল দেন? *
        <SearchableSelect
          value=""
          required={selected.length === 0}
          onChange={(e) => {
            const value = e.target.value;
            if (value)
              setSelected((current) =>
                current.includes(value) ? current : [...current, value],
              );
          }}
        >
          <option value="">মালের ধরন বাছুন</option>
          {options
            .filter((value) => !selected.includes(value))
            .map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
        </SearchableSelect>
      </label>
      {selected.length > 0 && (
        <div
          className="resource-actions"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}
        >
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              className="secondary"
              onClick={() =>
                setSelected((current) => current.filter((v) => v !== value))
              }
              aria-label={value + " বাদ দিন"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 9px",
                fontSize: 12,
              }}
            >
              {value}
              <X size={13} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <small>একাধিক ধরন দিতে আবার ড্রপডাউন থেকে বাছুন। × চাপলে বাদ যাবে।</small>
      <input type="hidden" name="kinds" value={selected.join(", ")} />
    </div>
  );
}
