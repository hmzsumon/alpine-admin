/* ────────── Bengali labels and small reusable controls ────────── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useState, type ReactNode } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { RawView } from "@/types/procurement";
export const units: Record<string, string> = {
  kg: "কেজি",
  piece: "পিস",
  liter: "লিটার",
  gram: "গ্রাম",
  portion: "পোরশন",
  pack: "প্যাক",
};
/* ────────── physical locations; preparation rooms share the normal stock movement flow ────────── */
export const locationKinds = {
  store: "স্টোর",
  freezer: "ফ্রিজ",
  kitchen: "কিচেন",
  preparation: "কাটিং / প্রস্তুতকরণ",
  cold_store: "কোল্ড স্টোর",
  other: "অন্যান্য",
} as const;
export const stages: Record<string, string> = {
  raw: "কাঁচা",
  processed: "পরিষ্কার/কাটা",
  cooked: "রান্না করা",
  supply: "উপকরণ",
};
export const methods: Record<string, string> = {
  cash: "নগদ টাকা",
  bkash: "বিকাশ",
  nagad: "নগদ মোবাইল",
  bank: "ব্যাংক",
  other: "অন্যান্য",
};
export const kinds: Record<string, string> = {
  supplier: "ব্যাপারীর তথ্য",
  product: "পণ্যের তথ্য",
  location: "স্থানের তথ্য",
  demand: "চাহিদা",
  demand_approve: "চাহিদা অনুমোদন",
  demand_close: "চাহিদা বন্ধ",
  receipt: "ক্রয় বিল / মাল গ্রহণ",
  payment: "পেমেন্ট / অগ্রিম",
  payment_void: "পেমেন্ট বাতিল",
  adjustment: "পাওনা সমন্বয়",
  supplier_return: "ব্যাপারীকে মাল ফেরত",
  opening: "শুরুর স্টক",
  transfer: "মাল হস্তান্তর",
  transfer_accept: "মাল বুঝে পাওয়া",
  transfer_resolve: "হস্তান্তরের নিষ্পত্তি",
  process: "কাটা / প্রসেসিং",
  cook: "রান্না তৈরি",
  consume: "ব্যবহার / নষ্ট / স্টাফ খাবার",
  closing: "কাঁচামালের দৈনিক ক্লোজিং",
};
export const taka = (n: number) =>
  "৳" +
  ((n === 0 ? 0 : n) / 100).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const amount = (n: number) =>
  Number((n / 1000).toFixed(3)).toLocaleString("bn-BD", {
    maximumFractionDigits: 3,
  });
export const plain = (n: number) => String(n / 1000);
export const productName = (d: RawView, id: string) =>
  d.catalog.products.find((p) => p.id === id)?.name || id;
export const locationName = (d: RawView, id: string) =>
  id.startsWith("transit:")
    ? "পথে / প্রাপ্তি বাকি"
    : d.catalog.locations.find((p) => p.id === id)?.name || id;
export const supplierName = (d: RawView, id: string) =>
  d.catalog.suppliers.find((p) => p.id === id)?.name || id;
export function RawDialog({
  title,
  busy,
  close,
  children,
}: {
  title: string;
  busy: boolean;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="raw-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) close();
      }}
    >
      <section
        className="raw-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <div>
            <small>ALPINE · ক্রয় ও স্টোর</small>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            disabled={busy}
            onClick={close}
            aria-label="বন্ধ করুন"
          >
            <X size={21} />
          </button>
        </header>
        <div className="raw-dialog-body">
          <fieldset disabled={busy}>{children}</fieldset>
        </div>
      </section>
    </div>
  );
}
export function Field({
  label,
  name,
  value,
  required = false,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? value}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={type === "date" ? undefined : 500}
      />
    </label>
  );
}
export function Num({
  label,
  name,
  defaultValue = "",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        inputMode="decimal"
        defaultValue={defaultValue}
        required={required}
        autoComplete="off"
        maxLength={30}
      />
    </label>
  );
}
/* ────────── preset reasons preserve readable audit notes without repetitive typing ────────── */
const reasonPresets: Record<string, readonly string[]> = {
  cook: [
    "নিয়মিত রান্নার জন্য",
    "নতুন ব্যাচ রান্না",
    "চাহিদা অনুযায়ী অতিরিক্ত রান্না",
  ],
  process: [
    "রান্নার জন্য কাটা / পরিষ্কার",
    "ফ্রিজে সংরক্ষণের জন্য প্রসেসিং",
    "মাছের পিস ও মাথা আলাদা করা",
  ],
  opening: ["সিস্টেম চালুর আগে থেকে থাকা স্টক", "আগের দিনের অবশিষ্ট স্টক"],
  consume: [
    "রান্না / কাজে ব্যবহার",
    "খাবার বিক্রি / পরিবেশন",
    "স্টাফের খাবার",
    "নষ্ট / ব্যবহার অনুপযোগী",
    "পড়ে গিয়ে নষ্ট",
  ],
  supplier_return: [
    "পণ্যের মান ভালো নয়",
    "ভুল পণ্য এসেছে",
    "বেশি মাল এসেছে",
    "নষ্ট / ক্ষতিগ্রস্ত পণ্য",
  ],
  resolve: [
    "পাঠানো ও পাওয়া পরিমাণে অমিল",
    "মাল মূল স্থানে ফেরত এসেছে",
    "পরিবহনের সময় নষ্ট",
    "মাল হারিয়েছে",
  ],
  adjustment: [
    "আগের হিসাবের ভুল সংশোধন",
    "ব্যাপারীর দেওয়া ছাড়",
    "বিলের অমিল সমন্বয়",
  ],
  demand_close: [
    "প্রয়োজনীয় মাল পাওয়া সম্পন্ন",
    "বাকি মাল আর প্রয়োজন নেই",
    "ব্যাপারী মাল দিতে পারবেন না",
  ],
  payment_void: [
    "একই পেমেন্ট দুবার এন্ট্রি হয়েছে",
    "টাকার পরিমাণ ভুল হয়েছে",
    "ভুল ব্যাপারীর নামে এন্ট্রি হয়েছে",
    "পেমেন্ট বাস্তবে হয়নি",
  ],
};
function ReasonField({ context }: { context: string }) {
  const options = reasonPresets[context] || [
    "নিয়মিত কাজের হিসাব",
    "আগের হিসাব সংশোধন",
  ];
  // Routine cooking needs no typing; exceptional/accounting actions require an explicit choice.
  const [selected, setSelected] = useState(
    context === "cook" || context === "process" ? options[0] : "",
  );
  const [detail, setDetail] = useState("");
  const other = selected === "other";
  return (
    <div>
      <label>
        কারণ বাছুন *
        <SearchableSelect
          required
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">কারণ নির্বাচন করুন</option>
          {options.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
          <option value="other">অন্যান্য — নিজে লিখব</option>
        </SearchableSelect>
      </label>
      <label>
        {other ? "আপনার কারণ লিখুন *" : "বাড়তি বিবরণ (ঐচ্ছিক)"}
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          required={other}
          maxLength={350}
          placeholder={
            other ? "কারণ লিখুন" : "প্রয়োজন হলে লিখুন; ফাঁকা রাখতে পারেন"
          }
          autoComplete="off"
        />
      </label>
      <input
        type="hidden"
        name="note"
        value={
          other
            ? detail.trim()
            : selected + (detail.trim() ? " — " + detail.trim() : "")
        }
      />
    </div>
  );
}
export function DateNote({
  date,
  noteRequired = false,
  reasonType = "general",
}: {
  date: string;
  noteRequired?: boolean;
  reasonType?: string;
}) {
  return (
    <div className="form-grid">
      <Field
        label="হিসাবের তারিখ"
        name="date"
        type="date"
        required
        defaultValue={date}
      />
      {noteRequired ? (
        <ReasonField key={reasonType} context={reasonType} />
      ) : (
        <Field label="বিবরণ / মন্তব্য (ঐচ্ছিক)" name="note" />
      )}
    </div>
  );
}
export function Save({
  busy,
  label = "নিশ্চিত করে সেভ করুন",
}: {
  busy: boolean;
  label?: string;
}) {
  return (
    <button className="primary" type="submit" disabled={busy}>
      {busy ? "সেভ হচ্ছে…" : label}
    </button>
  );
}
export type EntryLine = {
  productId: string;
  quantity: string;
  rate: string;
  weight?: string;
  pieces?: string;
};
export const emptyLine = (): EntryLine => ({
  productId: "",
  quantity: "",
  rate: "",
  weight: "",
  pieces: "",
});
export function Lines({
  data,
  lines,
  setLines,
  rates = false,
  receipt = false,
  outputs = false,
}: {
  data: RawView;
  lines: EntryLine[];
  setLines: (v: EntryLine[]) => void;
  rates?: boolean;
  receipt?: boolean;
  outputs?: boolean;
}) {
  const change = (index: number, patch: Partial<EntryLine>) =>
    setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  return (
    <div className="raw-lines">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>পণ্য / একক</th>
              <th>পরিমাণ</th>
              {rates && <th>প্রতি এককের দর (৳)</th>}
              {(receipt || outputs) && <th>ওজন কেজি (ঐচ্ছিক)</th>}
              {receipt && <th>আস্ত মাছ/পণ্যের সংখ্যা (ঐচ্ছিক)</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const p = data.catalog.products.find(
                (p) => p.id === line.productId,
              );
              return (
                <tr key={i}>
                  <td>
                    <SearchableSelect
                      required
                      value={line.productId}
                      onChange={(e) => change(i, { productId: e.target.value })}
                    >
                      <option value="">পণ্য বাছুন</option>
                      {data.catalog.products
                        .filter((p) => p.active)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} · {p.name} · {units[p.unit]}
                          </option>
                        ))}
                    </SearchableSelect>
                    {p && <small>{stages[p.stage]}</small>}
                  </td>
                  <td>
                    <input
                      aria-label={`লাইন ${i + 1} পরিমাণ`}
                      inputMode="decimal"
                      required
                      value={line.quantity}
                      onChange={(e) => change(i, { quantity: e.target.value })}
                      placeholder={p ? units[p.unit] : "পরিমাণ"}
                    />
                  </td>
                  {rates && (
                    <td>
                      <input
                        aria-label={`লাইন ${i + 1} দর`}
                        inputMode="decimal"
                        required={receipt}
                        value={line.rate}
                        onChange={(e) => change(i, { rate: e.target.value })}
                        placeholder={receipt ? "দর দিন" : "না জানলে ফাঁকা"}
                      />
                    </td>
                  )}
                  {(receipt || outputs) && (
                    <td>
                      <input
                        aria-label={`লাইন ${i + 1} কেজি`}
                        inputMode="decimal"
                        value={line.weight || ""}
                        onChange={(e) => change(i, { weight: e.target.value })}
                      />
                    </td>
                  )}
                  {receipt && (
                    <td>
                      <input
                        aria-label={`লাইন ${i + 1} আস্ত সংখ্যা`}
                        inputMode="numeric"
                        value={line.pieces || ""}
                        onChange={(e) => change(i, { pieces: e.target.value })}
                      />
                    </td>
                  )}
                  <td>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="লাইন বাদ দিন"
                      disabled={lines.length === 1}
                      onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rates && (
        <p className="raw-help">
          লাইনগুলোর আনুমানিক যোগফল:{" "}
          <strong>
            {lines.every(
              (l) =>
                l.quantity.trim() &&
                l.rate.trim() &&
                Number.isFinite(Number(l.quantity)) &&
                Number.isFinite(Number(l.rate)),
            )
              ? taka(
                  lines.reduce(
                    (sum, l) =>
                      sum +
                      Math.round(Number(l.quantity) * Number(l.rate) * 100),
                    0,
                  ),
                )
              : "সব পরিমাণ ও দর দিলে দেখা যাবে"}
          </strong>{" "}
          · চূড়ান্ত বিল সার্ভার হিসাব করে সেভ করবে।
        </p>
      )}
      <button
        type="button"
        className="secondary"
        disabled={lines.length >= 50}
        onClick={() => setLines([...lines, emptyLine()])}
      >
        <Plus size={14} />
        আরেকটি পণ্য
      </button>
    </div>
  );
}
export const formData = (f: HTMLFormElement) =>
  Object.fromEntries(new FormData(f).entries()) as Record<string, string>;
export function StockSelect({
  data,
  value,
  change,
}: {
  data: RawView;
  value: string;
  change: (v: string) => void;
}) {
  return (
    <label>
      কোন ব্যাচের স্টক থেকে?
      <SearchableSelect required value={value} onChange={(e) => change(e.target.value)}>
        <option value="">স্টক লাইন বাছুন</option>
        {data.balances
          .filter((b) => !b.locationId.startsWith("transit:"))
          .map((b) => {
            const lot = data.lots.find((l) => l._id === b.lotId),
              p = data.catalog.products.find((p) => p.id === lot?.productId);
            return (
              <option key={b._id} value={b._id}>
                {p?.code ? `#${p.code} · ` : ""}{p?.name} · {locationName(data, b.locationId)} ·{" "}
                {amount(b.quantity)} {units[p?.unit || ""]} · {lot?.batch}
              </option>
            );
          })}
      </SearchableSelect>
    </label>
  );
}
export function LocationSelect({
  data,
  name = "locationId",
  defaultValue,
  exclude,
}: {
  data: RawView;
  name?: string;
  defaultValue?: string;
  exclude?: string;
}) {
  return (
    <label>
      {name === "to" ? "কোথায় পাঠাবেন?" : "কোথায় রাখবেন?"}
      <SearchableSelect name={name} required defaultValue={defaultValue}>
        <option value="">স্থান বাছুন</option>
        {data.catalog.locations
          .filter((l) => l.active && l.id !== exclude)
          .map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
      </SearchableSelect>
    </label>
  );
}
