/* ── Component: DemandList; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import Link from "next/link";
import { Plus, Printer } from "lucide-react";
import { taka, supplierName } from "./shared";
export default function DemandList({
  data,
  search,
  manage,
  pay,
  busy,
  command,
  open,
  details,
}: RawPanelProps) {
  return (
    <section className="panel raw-panel">
      <div className="panel-title">
        <div>
          <h3>খোলা চাহিদা</h3>
          <p>চাহিদা তৈরি করলে স্টক বা দেনা বাড়বে না</p>
        </div>
        {manage && (
          <button
            className="primary"
            disabled={!data.catalog.suppliers.some((s) => s.active)}
            onClick={() => open("demand")}
          >
            <Plus size={16} />
            নতুন চাহিদা
          </button>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>চাহিদা / তারিখ</th>
              <th>ব্যাপারী</th>
              <th>পণ্য / আনুমানিক টাকা</th>
              <th>অবস্থা</th>
              <th>কাজ</th>
            </tr>
          </thead>
          <tbody>
            {data.demands
              .filter((d) =>
                supplierName(data, d.data.supplierId)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((d) => (
                <tr key={d._id}>
                  <td>
                    {d.no}
                    <small>
                      {d.date} · {d.actor}
                    </small>
                  </td>
                  <td>{supplierName(data, d.data.supplierId)}</td>
                  <td>
                    {d.data.lines.length}টি পণ্য
                    <small>
                      {d.data.total === null
                        ? "দর দেওয়া হয়নি"
                        : taka(d.data.total)}
                    </small>
                  </td>
                  <td>
                    <span className="raw-badge">
                      {d.data.status === "draft"
                        ? "খসড়া"
                        : d.data.fulfilled
                          ? "সব মাল পাওয়া হয়েছে"
                          : "অনুমোদিত"}
                    </span>
                  </td>
                  <td>
                    <div className="resource-actions">
                      <button
                        className="text-button"
                        onClick={() => details(d._id)}
                      >
                        বিস্তারিত
                      </button>
                      <Link
                        className="text-button"
                        target="_blank"
                        href={"/procurement-print/" + d._id}
                      >
                        <Printer size={14} />
                        প্রিন্ট
                      </Link>
                      {manage && d.data.status === "draft" && (
                        <button
                          className="text-button"
                          disabled={busy}
                          onClick={() =>
                            void command("demand_approve", { id: d._id })
                          }
                        >
                          অনুমোদন
                        </button>
                      )}
                      {manage &&
                        d.data.status === "approved" &&
                        !d.data.fulfilled && (
                          <button
                            className="text-button"
                            onClick={() => open("receipt", { record: d })}
                          >
                            মাল গ্রহণ
                          </button>
                        )}
                      {pay && (
                        <button
                          className="text-button"
                          onClick={() =>
                            open("payment", {
                              supplier: d.data.supplierId,
                              demand: d._id,
                            })
                          }
                        >
                          অগ্রিম
                        </button>
                      )}
                      {manage && (
                        <button
                          className="text-button"
                          onClick={() => open("demand_close", { record: d })}
                        >
                          বন্ধ করুন
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!data.demands.length && (
        <p className="raw-empty">
          চাহিদা নেই। পুরোনো বন্ধ চাহিদা রিপোর্ট / ইতিহাসে থাকবে।
        </p>
      )}
    </section>
  );
}
