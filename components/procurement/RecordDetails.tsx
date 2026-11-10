/* ── Component: human-readable immutable records, no raw JSON in operating screens ── */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { rawRequest } from "@/lib/procurement";
import type { RawCommand, RawView } from "@/types/procurement";
import {
  kinds,
  methods,
  taka,
  amount,
  units,
  productName,
  locationName,
  supplierName,
  Save,
  DateNote,
  formData,
} from "./shared";
export default function RecordDetails({
  id,
  data,
  command,
  busy,
  canPay,
  done,
}: {
  id: string;
  data: RawView;
  command: RawCommand;
  busy: boolean;
  canPay: boolean;
  done: () => void;
}) {
  const [detail, setDetail] = useState<any>(),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void rawRequest("records/" + encodeURIComponent(id))
      .then((r) => {
        if (alive) setDetail(r);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [id]);
  if (error) return <p className="form-error">{error}</p>;
  if (!detail) return <p>তথ্য আসছে…</p>;
  const r = detail.record,
    d = r.data,
    lines = d.lines || d.outputs;
  return (
    <div>
      <div className="raw-detail-head">
        <h3>{kinds[r.kind] || r.kind}</h3>
        <strong>{r.no}</strong>
        <small>
          {r.date} · {r.actor} ·{" "}
          {new Date(r.at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}
        </small>
      </div>
      {d.supplierId && (
        <p>
          ব্যাপারী: <strong>{supplierName(data, d.supplierId)}</strong>
        </p>
      )}
      {d.invoice && <p>ব্যাপারীর বিল নম্বর: {d.invoice}</p>}
      {d.productId && <p>পণ্য: {productName(data, d.productId)}</p>}
      {d.sourceProductId && (
        <p>ব্যবহার করা পণ্য: {productName(data, d.sourceProductId)}</p>
      )}
      {d.locationId && <p>স্থান: {locationName(data, d.locationId)}</p>}
      {d.from && <p>কোথা থেকে: {locationName(data, d.from)}</p>}
      {d.to && <p>কোথায়: {locationName(data, d.to)}</p>}
      {(d.lotId || d.sourceLotId) && (
        <p>
          মূল ব্যাচ:{" "}
          {detail.lots?.find((l: any) => l._id === (d.sourceLotId || d.lotId))
            ?.batch || "—"}
        </p>
      )}
      {d.quantity !== undefined && <p>পরিমাণ: {amount(d.quantity)}</p>}
      {d.received !== undefined && (
        <p>
          পেয়েছেন {amount(d.received)} · ফেরত {amount(d.returned)} · নষ্ট{" "}
          {amount(d.wasted)} · বাকি{" "}
          {amount(d.quantity - d.received - d.returned - d.wasted)}
        </p>
      )}
      {d.method && (
        <p>
          মাধ্যম: {methods[d.method]} ·{" "}
          {d.direction === "in" ? "টাকা ফেরত পেয়েছি" : "টাকা দেওয়া হয়েছে"}
        </p>
      )}
      {d.reference && <p>Transaction ID / রসিদ: {d.reference}</p>}
      {d.amount !== undefined && (
        <p>
          টাকা: <strong>{taka(d.amount)}</strong>
        </p>
      )}
      {d.total !== undefined && (
        <p>
          {r.kind === "demand" ? "আনুমানিক মোট" : "মোট বিল"}:{" "}
          <strong>{d.total === null ? "দর দেওয়া হয়নি" : taka(d.total)}</strong>
        </p>
      )}
      {d.extra > 0 && <p>অতিরিক্ত চার্জ: {taka(d.extra)}</p>}
      {d.discount > 0 && <p>ছাড়: {taka(d.discount)}</p>}
      {d.effect !== undefined && <p>পাওনায় পরিবর্তন: {taka(d.effect)}</p>}
      {d.proofUrl && (
        <p>
          <a href={d.proofUrl} target="_blank" rel="noreferrer">
            পেমেন্টের প্রমাণ খুলুন
          </a>
        </p>
      )}
      {d.note && <p className="raw-help">{d.note}</p>}
      {lines && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>পণ্য</th>
                <th>পরিমাণ</th>
                <th>দর / ওজন</th>
                <th>মোট</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l: any, i: number) => {
                const p = data.catalog.products.find(
                  (p) => p.id === l.productId,
                );
                return (
                  <tr key={i}>
                    <td>{l.name || p?.name}</td>
                    <td>
                      {amount(l.quantity)} {units[l.unit || p?.unit || ""]}
                    </td>
                    <td>
                      {l.rate !== undefined
                        ? l.rate === null
                          ? "দর নেই"
                          : taka(l.rate)
                        : l.weight !== undefined
                          ? amount(l.weight) + " কেজি"
                          : "—"}
                    </td>
                    <td>
                      {l.total === null
                        ? "—"
                        : l.total !== undefined
                          ? taka(l.total)
                          : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {d.rows && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>পণ্য / স্থান</th>
                <th>থাকার কথা</th>
                <th>পাওয়া গেছে</th>
                <th>অমিল / কারণ</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((l: any) => (
                <tr key={l.balanceId}>
                  <td>
                    {productName(data, l.productId)}
                    <small>{locationName(data, l.locationId)}</small>
                  </td>
                  <td>{amount(l.expected)}</td>
                  <td>{amount(l.actual)}</td>
                  <td>
                    {amount(l.difference)}
                    <small>{l.note}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {d.weightVerified !== undefined && (
        <p>
          ওজন মিলিয়ে যাচাই:{" "}
          {d.weightVerified ? "হ্যাঁ" : "না—পিস/পরিমাণের হিসাব"}
          {d.wasteWeight
            ? " · বাদ যাওয়া ওজন: " + amount(d.wasteWeight) + " কেজি"
            : ""}
        </p>
      )}
      {["demand", "receipt"].includes(r.kind) && (
        <p>
          <Link
            className="secondary"
            target="_blank"
            href={"/procurement-print/" + r._id}
          >
            প্রিন্ট / PDF খুলুন
          </Link>
        </p>
      )}
      {detail.related?.length > 0 && (
        <>
          <h3>এই চাহিদা / বিলের সংশ্লিষ্ট লেনদেন</h3>
          <div className="table-scroll">
            <table>
              <tbody>
                {detail.related.map((x: any) => (
                  <tr key={x._id}>
                    <td>
                      {x.date}
                      <small>{x.no}</small>
                    </td>
                    <td>{kinds[x.kind]}</td>
                    <td>
                      {x.data.amount !== undefined
                        ? taka(x.data.amount)
                        : x.data.total !== undefined
                          ? taka(x.data.total)
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {r.kind === "payment" && canPay && !detail.voided && (
        <form
          className="raw-danger"
          onSubmit={async (e) => {
            e.preventDefault();
            const p = formData(e.currentTarget);
            if (await command("payment_void", { ...p, id: r._id })) done();
          }}
        >
          <h3>ভুল পেমেন্ট বাতিল</h3>
          <p>
            মূল রেকর্ড থাকবে। উল্টো হিসাব যোগ হয়ে পাওনা ঠিক হবে। এটি
            বিকাশ/ব্যাংকে আসল টাকা ফেরত পাঠায় না।
          </p>
          <DateNote date={data.date} noteRequired />
          <label className="check-label">
            <input type="checkbox" required />
            এই পেমেন্টটি ভুল এন্ট্রি হয়েছে—বাতিল নিশ্চিত করছি
          </label>
          <Save busy={busy} label="পেমেন্ট এন্ট্রি বাতিল করুন" />
        </form>
      )}
      {detail.voided && (
        <p className="raw-help">
          এই পেমেন্ট আগেই বাতিল হয়েছে। মূল রেকর্ড ইতিহাসে রাখা আছে।
        </p>
      )}
    </div>
  );
}
