/* ── Component: ExpenseForm ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";

export default function ExpenseForm() {
  /* ────────── workspace state ────────── */
  const { data, setNotice, setModal, busy, save } = useAdminContext();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const amount = Number(f.get("amount"));
        const name = String(f.get("name")).trim();
        if (!name || !Number.isFinite(amount) || amount <= 0) return;
        if (
          await save({
            ...data,
            expenses: [
              {
                id: crypto.randomUUID(),
                name,
                amount,
                date: String(f.get("date")),
              },
              ...data.expenses,
            ],
          })
        ) {
          setModal(null);
          setNotice("Expense recorded");
        }
      }}
    >
      <label>
        Description *<input required name="name" />
      </label>
      <label>
        Amount (BDT) *
        <input required name="amount" type="number" min="0.01" step="0.01" />
      </label>
      <label>
        Date *
        <input
          required
          type="date"
          name="date"
          defaultValue={new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Dhaka",
          })}
        />
      </label>
      <button disabled={busy} className="primary">
        Save expense
      </button>
    </form>
  );
}
