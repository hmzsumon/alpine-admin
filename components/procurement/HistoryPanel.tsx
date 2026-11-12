/* ── Component: paged, filterable history retains older supplier/stock activity ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { useEffect, useState } from "react";
import { rawRequest } from "@/lib/procurement";
import type { RawView } from "@/types/procurement";
import { kinds, taka, supplierName, amount } from "./shared";
export default function HistoryPanel({
  data,
  details,
}: {
  data: RawView;
  details: (id: string) => void;
}) {
  const [kind, setKind] = useState(""),
    [page, setPage] = useState(0),
    [result, setResult] = useState<any>(),
    [error, setError] = useState("");
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [supplier, setSupplier] = useState("");
  useEffect(() => {
    let alive = true;
    void rawRequest(
      "records?page=" +
        page +
        "&kind=" +
        kind +
        "&from=" +
        from +
        "&to=" +
        to +
        "&supplierId=" +
        encodeURIComponent(supplier),
    )
      .then((r) => {
        if (alive) {
          setResult(r);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [kind, page, from, to, supplier, data.revision]);
  return (
    <section className="panel raw-panel">
      <div className="panel-title">
        <div>
          <h3>সব কাজের ইতিহাস</h3>
          <p>সময়, দায়িত্বপ্রাপ্ত ব্যক্তি, বিল, পেমেন্ট ও স্টকের রেকর্ড</p>
        </div>
        <SearchableSelect
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(0);
          }}
        >
          <option value="">সব ধরনের কাজ</option>
          {Object.entries(kinds).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SearchableSelect>
      </div>
      <div className="form-grid raw-pad">
        <label>
          তারিখ থেকে
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          তারিখ পর্যন্ত
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          ব্যাপারী
          <SearchableSelect
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              setPage(0);
            }}
          >
            <option value="">সব ব্যাপারী</option>
            {data.catalog.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SearchableSelect>
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>তারিখ / রেফারেন্স</th>
              <th>কাজ</th>
              <th>ব্যাপারী / বিবরণ</th>
              <th>টাকা / পরিমাণ</th>
              <th>দায়িত্বে</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result?.records.map((r: any) => (
              <tr key={r._id}>
                <td>
                  {r.date}
                  <small>{r.no}</small>
                </td>
                <td>{kinds[r.kind] || r.kind}</td>
                <td>
                  {r.data.supplierId
                    ? supplierName(data, r.data.supplierId)
                    : r.data.note || "—"}
                </td>
                <td>
                  {r.data.effect !== undefined
                    ? taka(r.data.effect)
                    : r.data.quantity !== undefined
                      ? amount(r.data.quantity)
                      : "—"}
                </td>
                <td>{r.actor}</td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => details(r._id)}
                  >
                    বিস্তারিত
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result && (
        <div className="resource-actions raw-pad">
          <button
            className="secondary"
            disabled={!page}
            onClick={() => setPage((p) => p - 1)}
          >
            আগের পৃষ্ঠা
          </button>
          <span>
            {page + 1} / {Math.max(1, Math.ceil(result.total / 100))} ·{" "}
            {result.total}টি রেকর্ড
          </span>
          <button
            className="secondary"
            disabled={(page + 1) * 100 >= result.total}
            onClick={() => setPage((p) => p + 1)}
          >
            পরের পৃষ্ঠা
          </button>
        </div>
      )}
    </section>
  );
}
