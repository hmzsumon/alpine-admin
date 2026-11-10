/* ── Component: ReceiptList; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import { PackagePlus } from "lucide-react";
import { taka, locationName, supplierName } from "./shared";
export default function ReceiptList({
  data,
  search,
  manage,
  pay,
  open,
  details,
}: RawPanelProps) {
  const recent = (kind: string) => data.records.filter((r) => r.kind === kind);

  return (
    <section className="panel raw-panel">
      <div className="panel-title">
        <div>
          <h3>মাল গ্রহণ ও ক্রয় বিল</h3>
          <p>সাম্প্রতিক বিল; পুরোনো সব বিল রিপোর্ট / ইতিহাসে আছে</p>
        </div>
        {manage && (
          <button
            className="primary"
            disabled={!data.catalog.suppliers.some((s) => s.active)}
            onClick={() => open("receipt")}
          >
            <PackagePlus size={16} />
            মাল গ্রহণ করুন
          </button>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>বিল / তারিখ</th>
              <th>ব্যাপারী</th>
              <th>পণ্য / স্থান</th>
              <th>আসল বিল</th>
              <th>কাজ</th>
            </tr>
          </thead>
          <tbody>
            {recent("receipt")
              .filter((r) =>
                supplierName(data, r.data.supplierId)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.no}
                    <small>
                      {r.date} · {r.data.invoice}
                    </small>
                  </td>
                  <td>{supplierName(data, r.data.supplierId)}</td>
                  <td>
                    {r.data.lines.length}টি পণ্য
                    <small>{locationName(data, r.data.locationId)}</small>
                  </td>
                  <td>{taka(r.data.total)}</td>
                  <td>
                    <div className="resource-actions">
                      <button
                        className="text-button"
                        onClick={() => details(r._id)}
                      >
                        বিল দেখুন
                      </button>
                      {pay && (
                        <button
                          className="text-button"
                          onClick={() =>
                            open("payment", {
                              supplier: r.data.supplierId,
                              receipt: r._id,
                            })
                          }
                        >
                          এই বিলে টাকা দিন
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="raw-help">
        চাহিদার তুলনায় কম মাল এলে শুধু পাওয়া পরিমাণ লিখুন। একই বিল আবার লিখবেন
        না। ফেরতের জন্য স্টোরের মূল ক্রয়-ব্যাচ বাছুন।
      </p>
    </section>
  );
}
