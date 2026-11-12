/* ── Component: OrderForm; one bill with separate dine-in and parcel lines ── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { matchesMenuSearch } from "@/utils/menuSearch";
import { useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import type { Order } from "@/types";
import { money } from "@/utils/format";
import SearchBox from "@/components/ui/SearchBox";
import MenuImage from "@/components/menu/MenuImage";
import MenuItemName from "@/components/menu/MenuItemName";
type Mode = "dine_in" | "parcel";
export default function OrderForm() {
  const { user } = useAuth();
  const { data, tables, stationName, setNotice, search, setSearch, setModal, cart, setCart, busy, save, orderTable, setOrderTable, appendOrderId, refreshWorkspace } = useAdminContext();
  const original = data.orders.find((o) => o.id === appendOrderId);
  const [type, setType] = useState<"dine_in" | "takeaway">(original?.orderType || (orderTable === "PARCEL" ? "takeaway" : "dine_in"));
  const [charge, setCharge] = useState("0"), [sending, setSending] = useState(false), [uncertain, setUncertain] = useState(false);
  const stableId = useRef(`AL-${crypto.randomUUID()}`), request = useRef<{ requestId: string; table: string; orderType: string; items: unknown[] } | null>(null);
  const modes: Mode[] = type === "takeaway" ? ["parcel"] : ["dine_in", "parcel"];
  const items = data.menu.flatMap((item) => modes.filter((m) => (cart[item.id + "|" + m] || 0) > 0).map((fulfillment) => ({ menuId: item.id, name: item.name, nameBn: item.nameBn, station: item.station, price: item.price!, quantity: cart[item.id + "|" + fulfillment], fulfillment })));
  const subtotal = items.reduce((s, l) => s + l.price * l.quantity, 0);
  return <form onSubmit={async (e) => {
    e.preventDefault(); if (busy || sending) return;
    if (!items.length && !request.current) { setNotice("অন্তত একটি খাবার যোগ করুন।"); return; }
    const f = new FormData(e.currentTarget);
    if (original) {
      const body = request.current || { requestId: crypto.randomUUID(), table: original.table, orderType: original.orderType || "dine_in", items: items.map((l) => ({ menuId: l.menuId, quantity: l.quantity, fulfillment: l.fulfillment, expectedPrice: l.price })) };
      request.current = body; setSending(true); setUncertain(true);
      try { const response = await fetch(`/api/orders/${encodeURIComponent(original.id)}/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json();
        if (!response.ok) { if ([400,403,404,409].includes(response.status) && !String(result.error).includes("Request ID")) { request.current = null; setUncertain(false); } throw new Error(result.error || "সেভ হয়নি"); }
        await refreshWorkspace(); setModal(null); setNotice("একই বিলে অতিরিক্ত খাবার / পার্সেল যোগ হয়েছে।");
      } catch (error) { setNotice(error instanceof Error ? error.message : "উত্তর পাওয়া যায়নি। একই অনুরোধ আবার পাঠান।"); } finally { setSending(false); }
      return;
    }
    const order: Order = { id: stableId.current, orderType: type, table: type === "takeaway" ? "PARCEL" : orderTable, waiter: String(f.get("waiter")).trim(), customerName: String(f.get("customerName") || "").trim(), customerPhone: String(f.get("customerPhone") || "").trim(), packingCharge: Number(charge), createdAt: new Date().toISOString(), status: "New", items };
    if (await save({ ...data, orders: [order, ...data.orders] })) { setModal(null); setNotice("অর্ডার সেভ হয়েছে। শুধু পার্সেল হলে সার্ভার টোকেন দিয়েছে।"); }
  }}>
    {original && <p className="info-note">একই বিলে যোগ হচ্ছে: {original.parcelToken || original.table} · {original.id}</p>}
    {uncertain && <p className="info-note">আগের অনুরোধের নিশ্চয়তা বাকি। নিচের বোতামে একই অনুরোধ আবার পাঠান; নতুন অর্ডার তৈরি করবেন না।</p>}
    <fieldset disabled={busy || sending || uncertain} className="order-fulfillment-fields">
      <div className="form-grid"><label>অর্ডারের ধরন<select value={type} disabled={!!original} onChange={(e) => { setType(e.target.value as typeof type); setCart({}); }}><option value="dine_in">এখানে খাবেন + চাইলে পার্সেল</option><option value="takeaway">শুধু পার্সেল — টেবিল লাগবে না</option></select></label>
      {type === "dine_in" && <label>টেবিল<SearchableSelect required value={orderTable} disabled={!!original} onChange={(e) => setOrderTable(e.target.value)}>{tables.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.id}</option>)}</SearchableSelect></label>}
      <label>দায়িত্বপ্রাপ্ত কর্মী<input name="waiter" defaultValue={original?.waiter || user.name} readOnly={!!original || user.role === "waiter"} required /></label>
      {!original && <><label>কাস্টমারের নাম (ঐচ্ছিক)<input name="customerName" maxLength={100} /></label><label>মোবাইল (ঐচ্ছিক)<input name="customerPhone" type="tel" maxLength={30} /></label><label>প্যাকিং চার্জ (৳)<input type="number" min={0} max={10000} step="0.01" value={charge} onChange={(e) => setCharge(e.target.value)} /></label></>}</div>
      <SearchBox value={search} onChange={setSearch} />
      <p className="info-note">একই খাবার এখানে খাওয়া ও পার্সেলের জন্য আলাদা করে যোগ করুন। কিচেনের টিকিটেও আলাদা দেখাবে।</p>
      <div className="order-picker">{data.menu.filter((m) => m.active && m.price !== null && matchesMenuSearch(m, search)).map((item) => <div key={item.id} className="parcel-picker-row"><div className="menu-item-identity"><MenuImage src={item.imageUrl} name={item.name} /><span><MenuItemName item={item} bengaliFirst /><small>{stationName(item.station)} · {money(item.price!)}</small></span></div><div className="parcel-quantity-options">{modes.map((mode) => {
        const key = item.id + "|" + mode, count = cart[key] || 0, all = modes.reduce((s, m) => s + (cart[item.id + "|" + m] || 0), 0), stock = data.stockSummary?.[item.id];
        return <div key={mode}><small className={mode === "parcel" ? "parcel-label" : "muted"}>{mode === "parcel" ? "পার্সেল" : "এখানে খাবেন"}</small><div className="stepper"><button type="button" aria-label={`${item.name} ${mode} কমান`} onClick={() => setCart({ ...cart, [key]: Math.max(0, count - 1) })}>−</button><b>{count}</b><button type="button" aria-label={`${item.name} ${mode} যোগ করুন`} disabled={stock?.available === false || count >= 99 || (stock?.quantity != null && all >= stock.quantity)} onClick={() => setCart({ ...cart, [key]: Math.min(99, count + 1) })}>+</button></div></div>;
      })}</div></div>)}</div>
      {!!items.length && <div className="parcel-order-preview">{items.map((line) => <p key={line.menuId + line.fulfillment}><span className={line.fulfillment === "parcel" ? "parcel-label" : ""}>{line.fulfillment === "parcel" ? "পার্সেল" : "এখানে খাবেন"}</span> · {line.quantity} × {line.nameBn || line.name} · {money(line.price * line.quantity)}</p>)}</div>}
    </fieldset>
    <div className="order-summary"><strong>{original ? "যোগ হবে" : "মোট"}: {money(subtotal + (original ? 0 : Number(charge) || 0))}</strong><button disabled={busy || sending} className="primary" type="submit">{sending ? "পাঠানো হচ্ছে…" : uncertain ? "একই অনুরোধ আবার পাঠান" : original ? "একই বিলে যোগ করুন" : "অর্ডার তৈরি করুন"}</button></div>
  </form>;
}
