/* ── Component: CatalogPanel; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import { Plus } from "lucide-react";
import { units, stages, locationKinds } from "./shared";
export default function CatalogPanel({ data, manage, open }: RawPanelProps) {
  return (
    <>
      <section className="panel raw-panel">
        <div className="panel-title">
          <div>
            <h3>কাঁচামাল ও প্রসেস করা পণ্য</h3>
            <p>এটি মেনুর খাবার নয়। প্রয়োজনমতো নিজস্ব পণ্য তৈরি করুন।</p>
          </div>
          {manage && (
            <button className="primary" onClick={() => open("product")}>
              <Plus size={16} />
              পণ্য যোগ করুন
            </button>
          )}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>কোড</th>
                <th>নাম / বিভাগ</th>
                <th>একক</th>
                <th>অবস্থা</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.catalog.products.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>
                    {p.name}
                    <small>
                      {p.category}
                      {!p.active ? " · বন্ধ" : ""}
                    </small>
                  </td>
                  <td>{units[p.unit]}</td>
                  <td>{stages[p.stage]}</td>
                  <td>
                    {manage && (
                      <button
                        className="text-button"
                        onClick={() => open("product", { item: p })}
                      >
                        এডিট
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel raw-panel">
        <div className="panel-title">
          <h3>স্টোর, প্রস্তুতকরণ ও কিচেনের স্থান</h3>
          {manage && (
            <button className="primary" onClick={() => open("location")}>
              <Plus size={16} />
              স্থান যোগ করুন
            </button>
          )}
        </div>
        <div className="raw-locations">
          {data.catalog.locations.map((l) => (
            <div key={l.id}>
              <strong>{l.name}</strong>
              <small>
                {locationKinds[l.kind] || l.kind}
                {!l.active ? " · বন্ধ" : ""}
              </small>
              {manage && (
                <button
                  className="text-button"
                  onClick={() => open("location", { item: l })}
                >
                  এডিট
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
