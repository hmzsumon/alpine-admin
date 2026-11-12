/* ── Components: lot transformations, physical transfers and independent closing ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useState } from "react";
import type { RawView, RawCommand, RawRecord } from "@/types/procurement";
import {
  StockSelect,
  LocationSelect,
  DateNote,
  Num,
  Save,
  Lines,
  emptyLine,
  formData,
  plain,
  amount,
  units,
  productName,
  locationName,
  type EntryLine,
} from "./shared";
export function StockForm({
  data,
  command,
  busy,
  done,
  mode,
  balanceId,
}: {
  data: RawView;
  command: RawCommand;
  busy: boolean;
  done: () => void;
  mode: string;
  balanceId?: string;
}) {
  const [selected, setSelected] = useState(balanceId || ""),
    [outputs, setOutputs] = useState<EntryLine[]>([emptyLine()]),
    [verifyWeight, setVerify] = useState(false);
  const b = data.balances.find((b) => b._id === selected),
    lot = data.lots.find((l) => l._id === b?.lotId),
    product = data.catalog.products.find((p) => p.id === lot?.productId);
  const processing = mode === "process" || mode === "cook";
  const outputData = {
    ...data,
    catalog: {
      ...data.catalog,
      products: data.catalog.products.filter((p) =>
        mode === "cook" ? p.stage === "cooked" : p.stage !== "cooked",
      ),
    },
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        if (
          await command(mode, {
            ...p,
            ...(mode !== "opening" ? { balanceId: selected } : {}),
            ...(processing ? { outputs, verifyWeight } : {}),
          })
        )
          done();
      }}
    >
      {mode === "opening" ? (
        <>
          <p className="raw-help">
            শুরুতে আগে থেকে থাকা বাস্তব স্টক লিখুন। এতে ব্যাপারীর পাওনা বাড়বে
            না। নতুন কেনাকাটা হলে মাল গ্রহণ ও বিল ব্যবহার করুন।
          </p>
          <label>
            পণ্য
            <SearchableSelect name="productId" required>
              <option value="">বাছুন</option>
              {data.catalog.products
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name} · {units[p.unit]}
                  </option>
                ))}
            </SearchableSelect>
          </label>
          <LocationSelect data={data} />
        </>
      ) : (
        <StockSelect data={data} value={selected} change={setSelected} />
      )}
      {product && (
        <p className="raw-help">
          এখন আছে:{" "}
          <strong>
            {amount(b!.quantity)} {units[product.unit]}
          </strong>{" "}
          · {product.name} · {locationName(data, b!.locationId)}
        </p>
      )}
      <Num
        name="quantity"
        label={
          processing
            ? `কত কাঁচামাল ব্যবহার হবে? ${product ? "(" + units[product.unit] + ")" : ""}`
            : mode === "transfer"
              ? "কত পরিমাণ পাঠাবেন?"
              : mode === "supplier_return"
                ? "কত মাল ফেরত দেবেন?"
                : "পরিমাণ *"
        }
        required
      />
      {mode === "transfer" && (
        <>
          <LocationSelect data={data} name="to" exclude={b?.locationId} />
          <p className="raw-help">
            পাঠানো মাল আলাদা ‘পথে’ থাকবে। গ্রহণকারী নিশ্চিত করলে গন্তব্যে উঠবে।
            কম পেলে বাকিটা নিষ্পত্তি না হওয়া পর্যন্ত অমিল দেখাবে।
          </p>
        </>
      )}
      {processing && (
        <>
          <LocationSelect data={data} defaultValue={b?.locationId} />
          <h3>
            {mode === "cook"
              ? "রান্নার পরে কী পাওয়া গেল?"
              : "কাটার / পরিষ্কারের পরে কী পাওয়া গেল?"}
          </h3>
          <p className="raw-help">
            উদাহরণ: রুই ৪ কেজি থেকে ২০ পিস এবং ১টি মাথা। পিস ও মাথা আলাদা আউটপুট
            দিন। আগে পণ্য সেটআপে প্রয়োজনীয় আউটপুট তৈরি রাখুন।
          </p>
          <Lines
            data={outputData}
            lines={outputs}
            setLines={setOutputs}
            outputs
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={verifyWeight}
              onChange={(e) => setVerify(e.target.checked)}
            />
            ওজনও মিলিয়ে নিশ্চিত করব
          </label>
          {verifyWeight && (
            <div className="form-grid">
              <Num
                name="inputWeight"
                label="ব্যবহারের আগে মোট কেজি (কেজি পণ্যে পরিমাণই ধরা হবে)"
              />
              <Num
                name="wasteWeight"
                label="পরিষ্কারে বাদ / রান্নায় কমা ওজন (কেজি)"
                defaultValue="0"
              />
            </div>
          )}
          <p className="raw-help">
            ওজন মিলালে আগের মোট কেজি = সব আউটপুটের কেজি + বাদ যাওয়া কেজি হতে
            হবে। শুধু পিস গুনলে ওজন যাচাইয়ের টিক দেবেন না।
          </p>
        </>
      )}
      {mode === "consume" && (
        <label>
          কেন কমবে?
          <select name="reason">
            <option value="usage">রান্না / কাজে ব্যবহার</option>
            <option value="served">রান্না করা খাবার বিক্রি / পরিবেশন</option>
            <option value="waste">নষ্ট / পড়ে গেছে</option>
            <option value="staff">স্টাফের খাবার</option>
          </select>
        </label>
      )}
      {mode === "supplier_return" && (
        <>
          <Num
            name="amount"
            label="এই ফেরতের জন্য ব্যাপারী বিল কত কমাবেন? (৳)"
            required
          />
          <p className="raw-help">
            মূল ক্রয়ের অবশিষ্ট মাল বাছুন। এই এন্ট্রিতে স্টক ও পাওনা কমবে। টাকা
            ফেরত পেলে আলাদাভাবে পেমেন্টে ‘টাকা ফেরত পেয়েছি’ দিন।
          </p>
        </>
      )}
      <DateNote
        date={data.date}
        noteRequired={mode !== "transfer"}
        reasonType={mode}
      />
      <Save busy={busy} />
    </form>
  );
}
export function TransferForm({
  data,
  record,
  mode,
  command,
  busy,
  done,
}: {
  data: RawView;
  record: RawRecord;
  mode: "accept" | "resolve";
  command: RawCommand;
  busy: boolean;
  done: () => void;
}) {
  const [outcome, setOutcome] = useState("return"),
    p = data.catalog.products.find((p) => p.id === record.data.productId),
    remaining =
      record.data.quantity -
      record.data.received -
      record.data.returned -
      record.data.wasted;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        if (
          await command(
            mode === "accept" ? "transfer_accept" : "transfer_resolve",
            {
              ...p,
              id: record._id,
              confirmReturned: p.confirmReturned === "on",
              outcome,
            },
          )
        )
          done();
      }}
    >
      <p className="raw-help">
        {record.no} · {productName(data, record.data.productId)}
        <br />
        {locationName(data, record.data.from)} →{" "}
        {locationName(data, record.data.to)}
        <br />
        এখনো পথে / অমিল: {amount(remaining)} {units[p?.unit || ""]}
      </p>
      <Num
        name="quantity"
        label={
          mode === "accept"
            ? "কতটুকু বাস্তবে বুঝে পেয়েছেন?"
            : "কতটুকুর নিষ্পত্তি করছেন?"
        }
        required
        defaultValue={plain(remaining)}
      />
      {mode === "resolve" && (
        <>
          <label>
            কী হয়েছে?
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="return">মূল স্থানে ফেরত পেয়েছি</option>
              <option value="waste">নষ্ট / হারিয়েছে</option>
            </select>
          </label>
          {outcome === "return" && (
            <label className="check-label">
              <input type="checkbox" name="confirmReturned" required />
              বাস্তবে মূল স্থানে ফেরত বুঝে পেয়েছি
            </label>
          )}
        </>
      )}
      <DateNote
        date={data.date}
        noteRequired={mode === "resolve"}
        reasonType={mode}
      />
      <Save busy={busy} />
    </form>
  );
}
export function ClosingForm({
  data,
  command,
  busy,
  done,
}: {
  data: RawView;
  command: RawCommand;
  busy: boolean;
  done: () => void;
}) {
  const [snapshot] = useState(data),
    [counts, setCounts] = useState<Record<string, string>>({}),
    [notes, setNotes] = useState<Record<string, string>>({});
  const rows = snapshot.balances.filter(
      (b) => !b.locationId.startsWith("transit:"),
    ),
    pending = snapshot.balances.some((b) =>
      b.locationId.startsWith("transit:"),
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        if (
          await command("closing", {
            ...p,
            confirmed: p.confirmed === "on",
            expectedRevision: snapshot.revision,
            rows: rows.map((b) => ({
              balanceId: b._id,
              actual: counts[b._id] || "",
              note: notes[b._id] || "",
            })),
          })
        )
          done();
      }}
    >
      <p className="raw-help">
        শুধু কাঁচামাল/স্টোরের হিসাব মিলবে। ওয়েটারের ক্লোজিং বদলাবে না। প্রতিটি
        ব্যাচ ও স্থান বাস্তবে গুনুন। একই দিনের ক্লোজিং চূড়ান্ত হলে ওই দিনের স্টক
        বদলাবে না।
      </p>
      {pending && (
        <p role="alert" className="form-error">
          পথে থাকা মাল আগে গ্রহণ বা নিষ্পত্তি করুন।
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>পণ্য / ব্যাচ / স্থান</th>
              <th>থাকার কথা</th>
              <th>বাস্তবে আছে *</th>
              <th>অমিলের কারণ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const lot = snapshot.lots.find((l) => l._id === b.lotId),
                p = snapshot.catalog.products.find(
                  (p) => p.id === lot?.productId,
                );
              return (
                <tr key={b._id}>
                  <td>
                    {p?.name}
                    <small>
                      {lot?.batch} · {locationName(snapshot, b.locationId)}
                    </small>
                  </td>
                  <td>
                    {amount(b.quantity)} {units[p?.unit || ""]}
                  </td>
                  <td>
                    <input
                      required
                      inputMode="decimal"
                      value={counts[b._id] || ""}
                      onChange={(e) =>
                        setCounts({ ...counts, [b._id]: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={notes[b._id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [b._id]: e.target.value })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p>
          এখন কোনো ধনাত্মক স্টক নেই। বাস্তবে মাল থাকলে আগে শুরুর স্টক / মাল
          গ্রহণ লিখুন।
        </p>
      )}
      <DateNote date={snapshot.date} />
      <label className="check-label">
        <input type="checkbox" name="confirmed" required />
        আমি বাস্তবে গুনে সব তথ্য যাচাই করেছি। এই দিনের ক্লোজিং চূড়ান্ত হবে।
      </label>
      <Save busy={busy} label="যাচাই করে দিন বন্ধ করুন" />
    </form>
  );
}
