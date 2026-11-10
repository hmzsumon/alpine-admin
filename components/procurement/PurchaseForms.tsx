/* ── Components: demand, actual receipt and supplier payment forms ── */
"use client";
import { useState, useEffect } from "react";
import { rawRequest } from "@/lib/procurement";
import type { RawView, RawCommand, RawRecord } from "@/types/procurement";
import {
  DateNote,
  Save,
  Field,
  Num,
  Lines,
  emptyLine,
  formData,
  LocationSelect,
  methods,
  taka,
  units,
  type EntryLine,
} from "./shared";
export function PaymentFields() {
  return (
    <div className="form-grid">
      <Num name="amount" label="কত টাকা? (৳) *" required />
      <label>
        মাধ্যম
        <select name="method">
          {Object.entries(methods).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <Field
        name="reference"
        label="Transaction ID / রসিদ নম্বর"
        placeholder="বিকাশ/নগদে অবশ্যই দিন"
      />
      <Field name="proofUrl" label="প্রমাণের https লিংক (ঐচ্ছিক)" />
    </div>
  );
}
function SupplierSelect({
  data,
  value,
  set,
}: {
  data: RawView;
  value: string;
  set: (v: string) => void;
}) {
  return (
    <label>
      ব্যাপারী *
      <select required value={value} onChange={(e) => set(e.target.value)}>
        <option value="">ব্যাপারী বাছুন</option>
        {data.catalog.suppliers
          .filter((s) => s.active)
          .map((s) => (
            <option value={s.id} key={s.id}>
              {s.name} · {s.phone}
            </option>
          ))}
      </select>
    </label>
  );
}
export function DemandForm({
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
  const [supplierId, setSupplier] = useState(""),
    [lines, setLines] = useState<EntryLine[]>([emptyLine()]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await command("demand", {
            ...formData(e.currentTarget),
            supplierId,
            lines,
          })
        )
          done();
      }}
    >
      <p className="raw-help">
        এটি চাহিদা—স্টক বা দেনা বাড়বে না। সেভের পরে অনুমোদন করে প্রিন্ট করুন। দর
        না জানলে খালি রাখুন।
      </p>
      <SupplierSelect data={data} value={supplierId} set={setSupplier} />
      <Field name="neededBy" label="কবে মাল লাগবে?" type="date" />
      <Lines data={data} lines={lines} setLines={setLines} rates />
      <DateNote date={data.date} />
      <Save busy={busy} label="খসড়া চাহিদা তৈরি করুন" />
    </form>
  );
}
export function ReceiptForm({
  data,
  command,
  busy,
  done,
  canPay,
  initialDemand,
}: {
  data: RawView;
  command: RawCommand;
  busy: boolean;
  done: () => void;
  canPay: boolean;
  initialDemand?: RawRecord;
}) {
  const [supplierId, setSupplier] = useState(
      initialDemand?.data.supplierId || "",
    ),
    [demandId, setDemand] = useState(initialDemand?._id || ""),
    [lines, setLines] = useState<EntryLine[]>(
      initialDemand
        ? initialDemand.data.lines.map((l: any) => ({
            productId: l.productId,
            quantity: "",
            rate: l.rate === null ? "" : String(l.rate / 100),
            weight: "",
            pieces: "",
          }))
        : [emptyLine()],
    ),
    [pay, setPay] = useState(false),
    [remaining, setRemaining] = useState<any>();
  useEffect(() => {
    if (!demandId) {
      setRemaining(undefined);
      return;
    }
    let alive = true;
    void rawRequest("records/" + encodeURIComponent(demandId))
      .then((r) => {
        if (alive) setRemaining(r);
      })
      .catch(() => {
        if (alive) setRemaining(undefined);
      });
    return () => {
      alive = false;
    };
  }, [demandId]);
  const selectDemand = (id: string) => {
    setDemand(id);
    const r = data.demands.find((d) => d._id === id);
    if (r)
      setLines(
        r.data.lines.map((l: any) => ({
          productId: l.productId,
          quantity: "",
          rate: l.rate === null ? "" : String(l.rate / 100),
          weight: "",
          pieces: "",
        })),
      );
    else setLines([emptyLine()]);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const p = formData(e.currentTarget);
        const { amount, method, reference, proofUrl, ...rest } = p;
        if (
          await command("receipt", {
            ...rest,
            supplierId,
            demandId,
            lines,
            ...(pay
              ? {
                  payment: {
                    amount,
                    method,
                    reference,
                    proofUrl,
                    direction: "out",
                    note: "মাল গ্রহণের সময় পেমেন্ট",
                  },
                }
              : {}),
          })
        )
          done();
      }}
    >
      <p className="raw-help">
        যতটুকু বাস্তবে পেয়েছেন শুধু ততটুকু লিখুন। এই পরিমাণ স্টকে উঠবে এবং আসল
        বিল ব্যাপারীর হিসাবে যোগ হবে। দাম অবশ্যই নিশ্চিত করুন।
      </p>
      <SupplierSelect
        data={data}
        value={supplierId}
        set={(v) => {
          setSupplier(v);
          setDemand("");
          setLines([emptyLine()]);
        }}
      />
      <label>
        কোন চাহিদার বিপরীতে?
        <select value={demandId} onChange={(e) => selectDemand(e.target.value)}>
          <option value="">চাহিদা ছাড়া সরাসরি ক্রয়</option>
          {data.demands
            .filter(
              (d) =>
                d.data.supplierId === supplierId &&
                d.data.status === "approved",
            )
            .map((d) => (
              <option key={d._id} value={d._id}>
                {d.no} · {d.date}
              </option>
            ))}
        </select>
      </label>
      <LocationSelect data={data} />
      {remaining && (
        <div className="raw-help">
          <strong>চাহিদায় এখনো বাকি:</strong>
          {remaining.record.data.lines.map((l: any) => {
            const got = remaining.related.reduce(
              (sum: number, r: any) =>
                sum +
                (r.kind === "receipt"
                  ? r.data.lines
                      .filter((x: any) => x.productId === l.productId)
                      .reduce((s: number, x: any) => s + x.quantity, 0)
                  : r.kind === "supplier_return" &&
                      r.data.productId === l.productId
                    ? -r.data.quantity
                    : 0),
              0,
            );
            return (
              <div key={l.productId}>
                {l.name}: {((l.quantity - got) / 1000).toLocaleString("bn-BD")}{" "}
                {units[l.unit]}
              </div>
            );
          })}
        </div>
      )}
      <Lines data={data} lines={lines} setLines={setLines} rates receipt />
      <div className="form-grid">
        <Num name="extra" label="অতিরিক্ত ভাড়া / চার্জ (৳)" defaultValue="0" />
        <Num name="discount" label="বিলে ছাড় (৳)" defaultValue="0" />
        <Field name="invoice" label="ব্যাপারীর বিল / চালান নম্বর" />
      </div>
      <p className="raw-help">
        আংশিক মাল এলে বাকি পরিমাণ চাহিদায় থাকবে। নতুন চালান একবারই লিখুন। একই
        বিল নম্বর দুবার গ্রহণ হবে না।
      </p>
      {canPay && (
        <>
          <label className="check-label">
            <input
              type="checkbox"
              checked={pay}
              onChange={(e) => setPay(e.target.checked)}
            />
            মাল নেওয়ার সময় টাকা দিচ্ছি
          </label>
          {pay && <PaymentFields />}
        </>
      )}
      <DateNote date={data.date} />
      <Save busy={busy} label="মাল গ্রহণ ও বিল নিশ্চিত করুন" />
    </form>
  );
}
export function FinanceForm({
  data,
  command,
  busy,
  done,
  mode = "payment",
  supplier,
  initialDemand,
  initialReceipt,
}: {
  data: RawView;
  command: RawCommand;
  busy: boolean;
  done: () => void;
  mode?: "payment" | "adjustment";
  supplier?: string;
  initialDemand?: string;
  initialReceipt?: string;
}) {
  const [supplierId, setSupplier] = useState(supplier || ""),
    [receipts, setReceipts] = useState<RawRecord[]>([]),
    [receiptId, setReceipt] = useState(initialReceipt || ""),
    [receiptPage, setReceiptPage] = useState(0),
    [receiptMore, setReceiptMore] = useState(false),
    [lookupError, setLookupError] = useState("");
  useEffect(() => {
    if (!supplierId) {
      setReceipts([]);
      return;
    }
    let alive = true;
    void rawRequest(
      "records?kind=receipt&supplierId=" +
        encodeURIComponent(supplierId) +
        "&page=" +
        receiptPage,
    )
      .then((r) => {
        if (alive) {
          setReceipts((old) =>
            receiptPage ? [...old, ...r.records] : r.records,
          );
          setReceiptMore((receiptPage + 1) * 100 < r.total);
          setLookupError("");
        }
      })
      .catch((e) => {
        if (alive) setLookupError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [supplierId, receiptPage]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (await command(mode, { ...formData(e.currentTarget), supplierId }))
          done();
      }}
    >
      <SupplierSelect
        data={data}
        value={supplierId}
        set={(v) => {
          setSupplier(v);
          setReceipt("");
          setReceiptPage(0);
        }}
      />
      {mode === "payment" ? (
        <>
          <p className="raw-help">
            বিলের আগে টাকা দিলে অগ্রিম হিসেবে থাকবে। পেমেন্ট স্টক বাড়াবে না।
            অতিরিক্ত দেওয়া টাকা অগ্রিম জমা দেখাবে।
          </p>
          <label>
            কোন চাহিদার অগ্রিম? (ঐচ্ছিক)
            <select name="demandId" defaultValue={initialDemand}>
              <option value="">ব্যাপারীর সাধারণ হিসাবে</option>
              {data.demands
                .filter((d) => d.data.supplierId === supplierId)
                .map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.no}
                  </option>
                ))}
            </select>
          </label>
          <label>
            নির্দিষ্ট ক্রয় বিল (ঐচ্ছিক)
            <select
              name="receiptId"
              value={receiptId}
              onChange={(e) => setReceipt(e.target.value)}
            >
              <option value="">ব্যাপারীর সাধারণ খাতা / অগ্রিম</option>
              {receipts.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.no} · {r.date} · {taka(r.data.total)}
                </option>
              ))}
            </select>
          </label>
          {receiptMore && (
            <button
              type="button"
              className="secondary"
              onClick={() => setReceiptPage((p) => p + 1)}
            >
              আরো পুরোনো বিল দেখুন
            </button>
          )}
          {lookupError && <p className="form-error">{lookupError}</p>}
          <label>
            টাকা দেওয়া / ফেরত পাওয়া
            <select name="direction">
              <option value="out">ব্যাপারীকে টাকা দিয়েছি</option>
              <option value="in">ব্যাপারীর কাছ থেকে টাকা ফেরত পেয়েছি</option>
            </select>
          </label>
          <PaymentFields />
        </>
      ) : (
        <>
          <p className="raw-help">
            মাল বা টাকা না বদলে আগের ভুল পাওনা সংশোধনের জন্য। কারণ লেখা
            বাধ্যতামূলক।
          </p>
          <Num name="amount" label="সমন্বয়ের টাকা (৳)" required />
          <label>
            কী করবেন?
            <select name="direction">
              <option value="increase">ব্যাপারীর পাওনা বাড়বে</option>
              <option value="decrease">ব্যাপারীর পাওনা কমবে</option>
            </select>
          </label>
        </>
      )}
      <DateNote date={data.date} noteRequired={mode === "adjustment"} />
      <Save busy={busy} />
    </form>
  );
}
