/* ── Component: PaymentList; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import { Plus } from "lucide-react";
import { taka, kinds, methods, supplierName } from "./shared";
export default function PaymentList({
  data,
  search,
  pay,
  open,
  details,
}: RawPanelProps) {
  return (
    <section className="panel raw-panel">
      <div className="panel-title">
        <div>
          <h3>পেমেন্ট ও অগ্রিম</h3>
          <p>নগদ, বিকাশ, নগদ মোবাইল ও ব্যাংক—প্রতিটি পেমেন্ট আলাদা রেকর্ড</p>
        </div>
        <div className="resource-actions">
          {pay && (
            <>
              <button
                className="secondary"
                disabled={!data.catalog.suppliers.length}
                onClick={() => open("adjustment")}
              >
                পাওনা সংশোধন
              </button>
              <button
                className="primary"
                disabled={!data.catalog.suppliers.some((s) => s.active)}
                onClick={() => open("payment")}
              >
                <Plus size={16} />
                পেমেন্ট / অগ্রিম দিন
              </button>
            </>
          )}
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>তারিখ / রেফারেন্স</th>
              <th>ব্যাপারী</th>
              <th>মাধ্যম / Transaction ID</th>
              <th>টাকা</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.records
              .filter(
                (r) =>
                  ["payment", "payment_void", "adjustment"].includes(r.kind) &&
                  supplierName(data, r.data.supplierId)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.date}
                    <small>{r.no}</small>
                  </td>
                  <td>
                    {supplierName(data, r.data.supplierId)}
                    <small>
                      {kinds[r.kind]}
                      {r.data.direction === "in" ? " · ফেরত পেয়েছি" : ""}
                    </small>
                  </td>
                  <td>
                    {methods[r.data.method] || "সমন্বয়"}
                    <small>{r.data.reference}</small>
                  </td>
                  <td>{taka(r.data.amount)}</td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => details(r._id)}
                    >
                      বিস্তারিত / সংশোধন
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
