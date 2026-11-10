/* ── Component: dated supplier ledger with full-history totals and pagination ── */
"use client";
import { useEffect, useState } from "react";
import { rawRequest } from "@/lib/procurement";
import { taka, kinds, methods } from "./shared";
export default function SupplierLedger({
  id,
  details,
}: {
  id: string;
  details: (id: string) => void;
}) {
  const [data, setData] = useState<any>(),
    [error, setError] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [page, setPage] = useState(0);
  useEffect(() => {
    let alive = true;
    setError("");
    void rawRequest(
      `suppliers/${encodeURIComponent(id)}/ledger?page=${page}&from=${from}&to=${to}`,
    )
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [id, page, from, to]);
  return (
    <div>
      {error && <p className="form-error">{error}</p>}
      {data && (
        <>
          <h3>{data.supplier.name}</h3>
          <p>
            {data.supplier.phone} · {data.supplier.address}
          </p>
          <div className="raw-summary">
            <div>
              <small>
                এখনকার মোট {data.currentBalance < 0 ? "অগ্রিম জমা" : "পাওনা"}
              </small>
              <strong>{taka(Math.abs(data.currentBalance))}</strong>
            </div>
            <div>
              <small>সব সময়ের নিট ক্রয় (ফেরত বাদে)</small>
              <strong>{taka(data.summary.purchases)}</strong>
            </div>
            <div>
              <small>সব সময়ের নিট দেওয়া টাকা (ফেরত/বাতিল বাদে)</small>
              <strong>{taka(data.summary.payments)}</strong>
            </div>
            <div>
              <small>সময় শুরুর বাকি / অগ্রিম</small>
              <strong>{taka(data.opening)}</strong>
            </div>
            <div>
              <small>নির্বাচিত সময়ে পরিবর্তন</small>
              <strong>{taka(data.periodChange)}</strong>
            </div>
          </div>
          <p className="raw-help">
            ধনাত্মক টাকা = ব্যাপারীর পাওনা বেড়েছে। ঋণাত্মক টাকা = পাওনা কমেছে /
            অগ্রিম হয়েছে। মোট পাওনায় সব পৃষ্ঠার হিসাব ধরা আছে।
          </p>
          <div className="form-grid">
            <label>
              যে তারিখ থেকে
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
              যে তারিখ পর্যন্ত
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
              />
            </label>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>তারিখ / রেফারেন্স</th>
                  <th>বিবরণ</th>
                  <th>মাধ্যম / প্রমাণ</th>
                  <th>হিসাবে পরিবর্তন</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.records.map((r: any) => (
                  <tr key={r._id}>
                    <td>
                      {r.date}
                      <small>{r.no}</small>
                    </td>
                    <td>
                      {kinds[r.kind] || r.kind}
                      <small>{r.data.note}</small>
                    </td>
                    <td>
                      {methods[r.data.method] || "—"}
                      <small>{r.data.reference}</small>
                      {r.data.proofUrl && (
                        <a
                          href={r.data.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          প্রমাণ খুলুন
                        </a>
                      )}
                    </td>
                    <td
                      className={r.data.effect > 0 ? "raw-amber" : "raw-green"}
                    >
                      {taka(r.data.effect)}
                    </td>
                    <td>
                      <button
                        type="button"
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
          {!data.total && (
            <p>এই সময়ে কোনো লেনদেন নেই। আগের বাকি উপরে দেখানো হয়েছে।</p>
          )}
          <div className="resource-actions">
            <button
              type="button"
              className="secondary"
              disabled={!page}
              onClick={() => setPage((p) => p - 1)}
            >
              আগের পৃষ্ঠা
            </button>
            <span>
              {page + 1} / {Math.max(1, Math.ceil(data.total / 100))} ·{" "}
              {data.total}টি লেনদেন
            </span>
            <button
              type="button"
              className="secondary"
              disabled={(page + 1) * 100 >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              পরের পৃষ্ঠা
            </button>
          </div>
        </>
      )}
    </div>
  );
}
