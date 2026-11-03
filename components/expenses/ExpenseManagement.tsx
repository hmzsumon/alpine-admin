/* ── Component: ExpenseManagement ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Plus } from "lucide-react";
import { money } from "@/utils/format";
import Empty from "@/components/ui/EmptyState";

export default function ExpenseManagement() {
  const { can } = useAuth();
  /* ────────── workspace state ────────── */
  const { data, setModal } = useAdminContext();

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h3>Expense ledger</h3>
          <p>Record purchases, utilities and daily expenses</p>
        </div>
        <button
          className="primary"
          disabled={!can("expenses:create")}
          onClick={() => setModal("expense")}
        >
          <Plus size={16} /> Record expense
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.date}</td>
                <td>{money(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.expenses.length && <Empty text="No expenses recorded yet." />}
      </div>
    </section>
  );
}
