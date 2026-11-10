/* ── Component: per-product totals; never adds incompatible units together ── */
"use client";
import type { RawView } from "@/types/procurement";
import { amount, units, stages } from "./shared";
export default function StockOverview({ data }: { data: RawView }) {
  const totals = new Map<
    string,
    { store: number; kitchen: number; transit: number }
  >();
  for (const b of data.balances) {
    const lot = data.lots.find((l) => l._id === b.lotId);
    if (!lot) continue;
    const row = totals.get(lot.productId) || {
      store: 0,
      kitchen: 0,
      transit: 0,
    };
    if (b.locationId.startsWith("transit:")) row.transit += b.quantity;
    else if (
      data.catalog.locations.find((l) => l.id === b.locationId)?.kind ===
      "kitchen"
    )
      row.kitchen += b.quantity;
    else row.store += b.quantity;
    totals.set(lot.productId, row);
  }
  return (
    <details className="panel raw-panel raw-stock-overview" open>
      <summary>প্রতি পণ্যের মোট অবশিষ্ট—স্টোর, কিচেন ও পথে</summary>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>পণ্য / অবস্থা</th>
              <th>একক</th>
              <th>স্টোর / ফ্রিজ</th>
              <th>কিচেন</th>
              <th>পথে / অমিল</th>
              <th>সব স্থানে মোট</th>
            </tr>
          </thead>
          <tbody>
            {[...totals].map(([id, n]) => {
              const p = data.catalog.products.find((p) => p.id === id);
              return (
                <tr key={id}>
                  <td>
                    {p?.name}
                    <small>{stages[p?.stage || ""]}</small>
                  </td>
                  <td>{units[p?.unit || ""]}</td>
                  <td>{amount(n.store)}</td>
                  <td>{amount(n.kitchen)}</td>
                  <td>{amount(n.transit)}</td>
                  <td>
                    <strong>{amount(n.store + n.kitchen + n.transit)}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!totals.size && (
        <p className="raw-empty">
          মাল গ্রহণ বা শুরুর স্টক দিলে এখানে মোট পরিমাণ দেখা যাবে।
        </p>
      )}
    </details>
  );
}
