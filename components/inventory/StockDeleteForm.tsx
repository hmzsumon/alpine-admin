/* ── Component: confirm removal of an empty stock setup, not the menu item ── */
"use client";
import type { StockPool, StockCommand } from "@/types/inventory";
export default function StockDeleteForm({
  pool,
  linkedNames,
  command,
  busy,
  onDone,
}: {
  pool: StockPool;
  linkedNames: string[];
  command: StockCommand;
  busy: boolean;
  onDone: () => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await command({
            action: "delete_pool",
            poolId: pool.id,
            version: pool.version,
          })
        )
          onDone();
      }}
    >
      <div className="inventory-help">
        <strong>{pool.name}</strong>
        <br />
        যুক্ত খাবার: {linkedNames.join(" · ")}
        <br />
        শুধু এই স্টক গ্রুপের সেটআপ ডিলিট হবে। মেনুর খাবার ও আগের হিসাবের ইতিহাস
        থাকবে। যুক্ত খাবারগুলো পরে অন্য স্টক গ্রুপে যোগ করতে পারবেন।
      </div>
      {pool.onHand !== 0 && (
        <p className="form-error">
          এই গ্রুপে {pool.onHand} {pool.unit} স্টক আছে। আগে অবশিষ্টের হিসাব
          নিষ্পত্তি করুন।
        </p>
      )}
      <p className="inventory-help">
        চলমান অর্ডার বা আজকের লেনদেন থাকলে সিস্টেম ডিলিট করবে না। সেটআপ সরানোর
        পরে ওই খাবারে এই গ্রুপের স্টক নিয়ন্ত্রণ থাকবে না।
      </p>
      <label className="check-label">
        <input type="checkbox" required />
        ভুল / অপ্রয়োজনীয় স্টক সেটআপটি ডিলিট করতে চাই।
      </label>
      <button
        type="submit"
        className="secondary"
        disabled={busy || pool.onHand !== 0}
        style={{ color: "#f08e9a" }}
      >
        {busy ? "ডিলিট হচ্ছে…" : "স্টক সেটআপ ডিলিট করুন"}
      </button>
    </form>
  );
}
