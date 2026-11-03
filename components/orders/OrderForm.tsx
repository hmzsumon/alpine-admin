/* ── Component: OrderForm ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { ArrowUpRight } from "lucide-react";
import type { Order } from "@/types";
import { money } from "@/utils/format";
import SearchBox from "@/components/ui/SearchBox";
import MenuImage from "@/components/menu/MenuImage";
import MenuItemName from "@/components/menu/MenuItemName";

export default function OrderForm() {
  const { user } = useAuth();
  /* ────────── workspace state ────────── */
  const {
    data,
    tables,
    setNotice,
    search,
    setSearch,
    setModal,
    cart,
    setCart,
    busy,
    save,
    orderTable,
    setOrderTable,
  } = useAdminContext();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const items = data.menu
          .filter((i) => cart[i.id] > 0 && i.active && i.price !== null)
          .map((i) => ({
            menuId: i.id,
            name: i.name,
            ...(i.nameBn ? { nameBn: i.nameBn } : {}),
            quantity: cart[i.id],
            price: i.price!,
            station: i.station,
          }));
        if (!items.length) {
          setNotice("Add at least one item");
          return;
        }
        const waiter = String(f.get("waiter")).trim();
        if (!waiter) return;
        const order: Order = {
          id: `AL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          table: orderTable,
          waiter,
          createdAt: new Date().toISOString(),
          status: "New",
          items,
        };
        if (await save({ ...data, orders: [order, ...data.orders] })) {
          setModal(null);
          setNotice("Order created. View station tickets in Kitchen & KOT.");
        }
      }}
    >
      <div className="form-grid">
        <label>
          Table
          <select
            value={orderTable}
            onChange={(e) => setOrderTable(e.target.value)}
          >
            {tables.map((table) => (
              <option key={table.id} value={table.id}>{table.name} · {table.id}</option>
            ))}
          </select>
        </label>
        <label>
          Waiter name *
          <input
            name="waiter"
            defaultValue={user.name}
            readOnly={user.role === "waiter"}
            required
            placeholder="Staff name"
          />
        </label>
      </div>
      <SearchBox value={search} onChange={setSearch} />
      <div className="order-picker">
        {data.menu
          .filter(
            (i) =>
              i.active &&
              i.price !== null &&
              `${i.name} ${i.nameBn || ""}`.normalize("NFC").toLowerCase().includes(search.normalize("NFC").toLowerCase())
          )
          .map((i) => (
            <div key={i.id}>
              <div className="menu-item-identity">
              <MenuImage src={i.imageUrl} name={i.name} />
              <span>
                <MenuItemName item={i} bengaliFirst />
                <small>
                  {i.station} · {money(i.price!)}
                </small>
                {data.stockSummary?.[i.id] && <small className={!data.stockSummary[i.id].available ? "amber-text" : ""}>
                  {data.stockSummary[i.id].available ? data.stockSummary[i.id].quantity === null ? "Available" : `${data.stockSummary[i.id].quantity} available`
                    : data.stockSummary[i.id].reason}
                </small>}
              </span>
              </div>
              <div className="stepper">
                <button
                  aria-label={`Remove ${i.name}`}
                  type="button"
                  onClick={() =>
                    setCart({
                      ...cart,
                      [i.id]: Math.max(0, (cart[i.id] || 0) - 1),
                    })
                  }
                >
                  −
                </button>
                <b>{cart[i.id] || 0}</b>
                <button
                  aria-label={`Add ${i.name}`}
                  type="button"
                  disabled={data.stockSummary?.[i.id]?.available === false || (data.stockSummary?.[i.id]?.quantity !== null && data.stockSummary?.[i.id]?.quantity !== undefined && (cart[i.id] || 0) >= data.stockSummary[i.id].quantity!)}
                  onClick={() =>
                    setCart({
                      ...cart,
                      [i.id]: Math.min(99, (cart[i.id] || 0) + 1),
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="order-summary">
        <strong>
          Total{" "}
          {money(
            data.menu.reduce(
              (s, i) => s + (cart[i.id] || 0) * (i.price || 0),
              0
            )
          )}
        </strong>
        <button disabled={busy} className="primary" type="submit">
          Create order <ArrowUpRight size={16} />
        </button>
      </div>
    </form>
  );
}
