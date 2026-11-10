/* ── Component: SupplierList; one step of the independent purchasing workspace ── */
"use client";
import type { RawPanelProps } from "./panelTypes";
import { Plus } from "lucide-react";
import { taka } from "./shared";
export default function SupplierList({
  data,
  search,
  manage,
  pay,
  open,
}: RawPanelProps) {
  const filteredSuppliers = data.catalog.suppliers.filter((s) =>
    (s.name + " " + s.phone + " " + s.kinds.join(" "))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <section className="panel raw-panel">
      <div className="panel-title">
        <div>
          <h3>ব্যাপারীর খাতা</h3>
          <p>মাছ, মাংস, সবজি, মসলা—একাধিক ধরন রাখা যাবে</p>
        </div>
        {manage && (
          <button className="primary" onClick={() => open("supplier")}>
            <Plus size={16} />
            ব্যাপারী যোগ করুন
          </button>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ব্যাপারী / ধরন</th>
              <th>যোগাযোগ</th>
              <th>এখনকার হিসাব</th>
              <th>কাজ</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((s) => {
              const t = data.totals.find((t) => t.supplierId === s.id),
                balance = t?.balance || 0;
              return (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <small>
                      {s.kinds.join(" · ")}
                      {!s.active ? " · বন্ধ" : ""}
                    </small>
                  </td>
                  <td>
                    {s.phone || "—"}
                    <small>
                      {s.contact} · {s.address}
                    </small>
                  </td>
                  <td>
                    <strong className={balance > 0 ? "raw-amber" : "raw-green"}>
                      {taka(Math.abs(balance))}
                    </strong>
                    <small>
                      {balance > 0
                        ? "ব্যাপারী পাবেন"
                        : balance < 0
                          ? "অগ্রিম জমা আছে"
                          : "কোনো বাকি নেই"}
                    </small>
                  </td>
                  <td>
                    <div className="resource-actions">
                      <button
                        className="text-button"
                        onClick={() => open("ledger", { id: s.id })}
                      >
                        হিসাব দেখুন
                      </button>
                      {pay && s.active && (
                        <button
                          className="text-button"
                          onClick={() => open("payment", { supplier: s.id })}
                        >
                          টাকা দিন
                        </button>
                      )}
                      {manage && (
                        <button
                          className="text-button"
                          onClick={() => open("supplier", { item: s })}
                        >
                          এডিট
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!data.catalog.suppliers.length && (
        <p className="raw-empty">
          এখনো ব্যাপারী নেই। প্রথমে নিজের আসল ব্যাপারী যোগ করুন; এখানে নমুনা
          লেনদেন দেওয়া হয়নি।
        </p>
      )}
    </section>
  );
}
