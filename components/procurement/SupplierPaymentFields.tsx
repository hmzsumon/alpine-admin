/* ── Component: supplier payment destination; preserve account numbers as text ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useState } from "react";
import type { RawSupplier, SupplierPaymentAccount } from "@/types/procurement";
export const mobileProviders = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  other: "অন্যান্য",
};
export function supplierAccountLabel(supplier: RawSupplier) {
  const p = supplier.paymentAccount;
  if (!p)
    return supplier.bkash ? "বিকাশ / পেমেন্ট নম্বর: " + supplier.bkash : "";
  return (
    (p.type === "bank"
      ? "ব্যাংক: " + p.bankName
      : mobileProviders[p.provider]) +
    " · " +
    p.accountNumber
  );
}
export default function SupplierPaymentFields({
  item,
}: {
  item?: RawSupplier;
}) {
  const saved =
    item?.paymentAccount ||
    (item?.bkash
      ? {
          type: "mobile" as const,
          provider: "bkash" as const,
          accountNumber: item.bkash,
        }
      : null);
  const [type, setType] = useState(saved?.type || "");
  const [provider, setProvider] = useState(
    saved?.type === "mobile" ? saved.provider : "bkash",
  );
  const [mobileNumber, setMobileNumber] = useState(
    saved?.type === "mobile" ? saved.accountNumber : "",
  );
  const [bankNumber, setBankNumber] = useState(
    saved?.type === "bank" ? saved.accountNumber : "",
  );
  const [bankName, setBankName] = useState(
    saved?.type === "bank" ? saved.bankName : "",
  );
  const account: SupplierPaymentAccount | null =
    type === "mobile"
      ? { type, provider, accountNumber: mobileNumber.trim() }
      : type === "bank"
        ? { type, bankName: bankName.trim(), accountNumber: bankNumber.trim() }
        : null;
  return (
    <section>
      <h3>পেমেন্ট অ্যাকাউন্ট</h3>
      <label>
        পেমেন্টের ধরন
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
          <option value="mobile">মোবাইল ব্যাংকিং</option>
          <option value="bank">ব্যাংক</option>
        </select>
      </label>
      {type === "mobile" && (
        <div className="form-grid">
          <label>
            মোবাইল ব্যাংকিং সেবা *
            <SearchableSelect
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as keyof typeof mobileProviders)
              }
            >
              {Object.entries(mobileProviders).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </SearchableSelect>
          </label>
          <label>
            মোবাইল ব্যাংকিং অ্যাকাউন্ট নম্বর *
            <input
              required
              type="tel"
              inputMode="tel"
              maxLength={30}
              autoComplete="off"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="যেমন: 017XXXXXXXX"
            />
          </label>
        </div>
      )}
      {type === "bank" && (
        <div className="form-grid">
          <label>
            ব্যাংকের নাম *
            <input
              required
              maxLength={150}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="ব্যাংকের নাম লিখুন"
            />
          </label>
          <label>
            ব্যাংক অ্যাকাউন্ট নম্বর *
            <input
              required
              type="text"
              maxLength={60}
              autoComplete="off"
              value={bankNumber}
              onChange={(e) => setBankNumber(e.target.value)}
              placeholder="অ্যাকাউন্ট নম্বর লিখুন"
            />
          </label>
        </div>
      )}
      <input
        type="hidden"
        name="paymentAccountJson"
        value={JSON.stringify(account)}
      />
    </section>
  );
}
