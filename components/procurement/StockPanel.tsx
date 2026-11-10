/* ── Component: StockPanel; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import { CheckCircle2 } from "lucide-react";
import {
  amount,
  units,
  stages,
  productName,
  locationName,
  supplierName,
} from "./shared";
import StockOverview from "./StockOverview";
export default function StockPanel({
  data,
  search,
  manage,
  operate,
  canClose,
  open,
}: RawPanelProps) {
  const stocks = data.balances
    .map((b) => ({ b, lot: data.lots.find((l) => l._id === b.lotId) }))
    .filter(({ lot }) =>
      (productName(data, lot?.productId || "") + " " + (lot?.batch || ""))
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  return (
    <>
      <StockOverview data={data} />
      <section className="panel raw-panel">
        <div className="panel-title">
          <div>
            <h3>ব্যাচ অনুযায়ী স্টোর ও কিচেন</h3>
            <p>
              পিস, কেজি ও লিটার একসঙ্গে যোগ করা হবে না · শেষ ক্লোজিং:{" "}
              {data.catalog.lastClosedDate || "এখনো হয়নি"}
            </p>
          </div>
          <div className="resource-actions">
            {manage && (
              <button className="secondary" onClick={() => open("opening")}>
                শুরুর স্টক
              </button>
            )}
            {canClose && (
              <button
                className="primary"
                disabled={data.catalog.lastClosedDate === data.date}
                onClick={() => open("closing")}
              >
                <CheckCircle2 size={16} />
                {data.catalog.lastClosedDate === data.date
                  ? "আজ বন্ধ হয়েছে"
                  : "গুনে দিন বন্ধ করুন"}
              </button>
            )}
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>পণ্য / অবস্থা</th>
                <th>ব্যাচ / তারিখ</th>
                <th>স্থান</th>
                <th>এখন আছে</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(({ b, lot }) => {
                const p = data.catalog.products.find(
                    (p) => p.id === lot?.productId,
                  ),
                  transit = b.locationId.startsWith("transit:");
                return (
                  <tr key={b._id}>
                    <td>
                      <strong>{p?.name}</strong>
                      <small>
                        {p?.code} · {stages[p?.stage || ""]}
                      </small>
                    </td>
                    <td>
                      {lot?.batch}
                      <small>
                        {lot?.date}
                        {lot?.supplierId
                          ? " · " + supplierName(data, lot.supplierId)
                          : ""}
                      </small>
                    </td>
                    <td>{locationName(data, b.locationId)}</td>
                    <td>
                      <strong>
                        {amount(b.quantity)} {units[p?.unit || ""]}
                      </strong>
                    </td>
                    <td>
                      {!transit && (
                        <div className="resource-actions">
                          {operate && (
                            <>
                              <button
                                className="text-button"
                                onClick={() =>
                                  open("transfer", { balanceId: b._id })
                                }
                              >
                                পাঠান
                              </button>
                              {p?.stage !== "cooked" && (
                                <>
                                  <button
                                    className="text-button"
                                    onClick={() =>
                                      open("process", { balanceId: b._id })
                                    }
                                  >
                                    কাটুন / প্রসেস
                                  </button>
                                  <button
                                    className="text-button"
                                    onClick={() =>
                                      open("cook", { balanceId: b._id })
                                    }
                                  >
                                    রান্না
                                  </button>
                                </>
                              )}
                              <button
                                className="text-button"
                                onClick={() =>
                                  open("consume", { balanceId: b._id })
                                }
                              >
                                ব্যবহার / নষ্ট
                              </button>
                            </>
                          )}
                          {manage && lot?.receiptId && (
                            <button
                              className="text-button"
                              onClick={() =>
                                open("supplier_return", {
                                  balanceId: b._id,
                                })
                              }
                            >
                              ব্যাপারীকে ফেরত
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!data.balances.length && (
          <p className="raw-empty">
            এখন কোনো মাল জমা নেই। বাস্তবে মাল গ্রহণ করুন বা আগে থেকে থাকা মাল
            শুরুর স্টক হিসেবে লিখুন।
          </p>
        )}
      </section>
      <section className="panel raw-panel">
        <div className="panel-title">
          <h3>পাঠানো মাল / প্রাপ্তি নিশ্চিতকরণ</h3>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>রেফারেন্স / পণ্য</th>
                <th>কোথা থেকে → কোথায়</th>
                <th>পাঠানো / পাওয়া / বাকি</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {data.pending.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.no}
                    <small>{productName(data, r.data.productId)}</small>
                  </td>
                  <td>
                    {locationName(data, r.data.from)} →{" "}
                    {locationName(data, r.data.to)}
                  </td>
                  <td>
                    {amount(r.data.quantity)} / {amount(r.data.received)} /{" "}
                    <strong>
                      {amount(
                        r.data.quantity -
                          r.data.received -
                          r.data.returned -
                          r.data.wasted,
                      )}
                    </strong>
                  </td>
                  <td>
                    {operate && (
                      <div className="resource-actions">
                        <button
                          className="text-button"
                          onClick={() => open("accept", { record: r })}
                        >
                          বুঝে পেয়েছি
                        </button>
                        <button
                          className="text-button"
                          onClick={() => open("resolve", { record: r })}
                        >
                          ফেরত / অমিল
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.pending.length && (
          <p className="raw-empty">মাল গ্রহণের কোনো অমিল বা অপেক্ষা নেই।</p>
        )}
      </section>
    </>
  );
}
