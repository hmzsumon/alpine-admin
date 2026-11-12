/* ── Component: supplier/product/location forms, independent of food menu ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import SupplierKindsField from "./SupplierKindsField";
import SupplierPaymentFields from "./SupplierPaymentFields";
import { locationKinds } from "./shared";
import type {
  RawCommand,
  RawSupplier,
  RawProduct,
  RawLocation,
} from "@/types/procurement";
import { Field, Num, Save, units, stages, formData } from "./shared";
export function SupplierForm({
  item,
  command,
  busy,
  done,
}: {
  item?: RawSupplier;
  command: RawCommand;
  busy: boolean;
  done: () => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const { paymentAccountJson, ...p } = formData(e.currentTarget);
        if (
          await command("supplier", {
            ...p,
            paymentAccount: JSON.parse(paymentAccountJson || "null"),
            ...(item ? { id: item.id, version: item.version } : {}),
            active: p.active !== "no",
          })
        )
          done();
      }}
    >
      <div className="form-grid">
        <Field
          name="name"
          label="ব্যাপারী / প্রতিষ্ঠানের নাম *"
          required
          value={item?.name}
        />
        <Field name="contact" label="যোগাযোগের ব্যক্তি" value={item?.contact} />
        <Field name="phone" label="মোবাইল নম্বর" value={item?.phone} />
        <SupplierKindsField initial={item?.kinds} />
        <Field name="address" label="ঠিকানা" value={item?.address} />
      </div>
      <SupplierPaymentFields item={item} />
      {!item && (
        <div className="form-grid">
          <Num
            name="opening"
            label="আগে থেকে বাকি / অগ্রিম (৳)"
            defaultValue="0"
          />
          <label>
            আগের টাকার ধরন
            <select name="openingType">
              <option value="due">ব্যাপারী আমার কাছে পাবেন</option>
              <option value="advance">আমার অগ্রিম জমা আছে</option>
            </select>
          </label>
        </div>
      )}
      {item && (
        <p className="raw-help">
          আগের বাকি এখানে বদলাবে না। ভুল হলে কারণসহ পাওনা সমন্বয় করুন।
        </p>
      )}
      <Field name="note" label="মন্তব্য" value={item?.note} />
      <label>
        অবস্থা
        <select
          name="active"
          defaultValue={item?.active === false ? "no" : "yes"}
        >
          <option value="yes">সক্রিয়</option>
          <option value="no">বন্ধ / আর্কাইভ</option>
        </select>
      </label>
      <Save busy={busy} />
    </form>
  );
}
export function ProductForm({
  item,
  command,
  busy,
  done,
}: {
  item?: RawProduct;
  command: RawCommand;
  busy: boolean;
  done: () => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        if (
          await command("product", {
            ...p,
            ...(item ? { id: item.id, version: item.version } : {}),
            active: p.active !== "no",
          })
        )
          done();
      }}
    >
      <p className="raw-help">
        আস্ত মাছ, কাটা পিস, মাথা ও রান্না করা মাছ আলাদা পণ্য হিসেবে রাখুন। এটি
        ওয়েটারের মেনু নয়।
      </p>
      <div className="form-grid">
        <Field name="name" label="পণ্যের নাম *" required value={item?.name} />
        <Field
          name="category"
          label="বিভাগ *"
          required
          value={item?.category}
          placeholder="মাছ / মাংস / মসলা"
        />
        <label>
          কোন এককে গুনবেন?
          <SearchableSelect name="unit" defaultValue={item?.unit || "kg"}>
            {Object.entries(units).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </SearchableSelect>
        </label>
        <label>
          পণ্যের অবস্থা
          <SearchableSelect name="stage" defaultValue={item?.stage || "raw"}>
            {Object.entries(stages).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </SearchableSelect>
        </label>
      </div>
      <label>
        অবস্থা
        <select
          name="active"
          defaultValue={item?.active === false ? "no" : "yes"}
        >
          <option value="yes">সক্রিয়</option>
          <option value="no">বন্ধ</option>
        </select>
      </label>
      <Save busy={busy} />
    </form>
  );
}
export function LocationForm({
  item,
  command,
  busy,
  done,
}: {
  item?: RawLocation;
  command: RawCommand;
  busy: boolean;
  done: () => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        if (
          await command("location", {
            ...p,
            ...(item ? { id: item.id, version: item.version } : {}),
            active: p.active !== "no",
          })
        )
          done();
      }}
    >
      <Field name="name" label="স্থানের নাম *" required value={item?.name} />
      <label>
        ধরন
        <SearchableSelect name="kind" defaultValue={item?.kind || "store"}>
          {Object.entries(locationKinds).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SearchableSelect>
      </label>
      <p className="raw-help">
        মাছ, মাংস ও সবজি কাটা বা পরিষ্কার করার ঘরের জন্য ‘কাটিং / প্রস্তুতকরণ’
        বাছুন।
      </p>
      <label>
        অবস্থা
        <select
          name="active"
          defaultValue={item?.active === false ? "no" : "yes"}
        >
          <option value="yes">সক্রিয়</option>
          <option value="no">বন্ধ</option>
        </select>
      </label>
      <Save busy={busy} />
    </form>
  );
}
