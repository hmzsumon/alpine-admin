/* ── Component: InventoryManagement ────────────────────────────────────── */
"use client";
import { useCallback, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, PackageCheck, Plus, RefreshCw, Sunrise, Sunset } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useInventory } from "@/hooks/useInventory";
import SearchBox from "@/components/ui/SearchBox";
import InventoryDialog from "@/components/inventory/InventoryDialog";
import StockPoolForm from "@/components/inventory/StockPoolForm";
import StockMovementForm from "@/components/inventory/StockMovementForm";
import StockDayForm from "@/components/inventory/StockDayForm";
import StockHistory from "@/components/inventory/StockHistory";
import type { StockPool } from "@/types/inventory";
type Dialog = { kind: "setup"; pool?: StockPool; menuId?: string } | { kind: "move"; pool: StockPool; action: string } | { kind: "open" | "close" };

export default function InventoryManagement() {
  const stock = useInventory(), { can } = useAuth();
  const [dialog, setDialog] = useState<Dialog | null>(null), [search, setSearch] = useState(""), [station, setStation] = useState("All stations"), [selected, setSelected] = useState("");
  const busyRef = useRef(false); busyRef.current = stock.busy;
  const close = useCallback(() => { if (!busyRef.current) setDialog(null); }, []);
  const finish = useCallback(() => setDialog(null), []);
  const data = stock.data;
  if (!data) return <section className="panel"><div className="panel-title"><h3>Stock & daily closing</h3><button type="button" className="secondary" onClick={() => void stock.refresh()}><RefreshCw size={15} /> Retry</button></div>
    <p className={stock.error ? "form-error inventory-empty" : "inventory-empty"}>{stock.error || "Loading restaurant stock…"}</p></section>;
  const { inventory } = data;
  const reserved = (pool: StockPool) => inventory.allocations.filter((row) => row.poolId === pool.id && row.status === "reserved").reduce((sum, row) => sum + row.quantity, 0);
  const available = (pool: StockPool) => pool.onHand - reserved(pool);
  const counted = inventory.pools.filter((pool) => pool.mode === "counted");
  const low = counted.filter((pool) => available(pool) > 0 && available(pool) <= pool.lowAt && !pool.soldOut).length;
  const soldOut = inventory.pools.filter((pool) => pool.soldOut || (pool.mode === "counted" && available(pool) <= 0)).length;
  const linked = new Set(inventory.pools.flatMap((pool) => pool.links.map((link) => link.menuId)));
  const untracked = data.menu.filter((item) => !linked.has(item.id));
  const pools = inventory.pools.filter((pool) => (station === "All stations" || pool.station === station) &&
    `${pool.name} ${pool.unit} ${pool.links.map((link) => data.menu.find((item) => item.id === link.menuId)?.name).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const title = dialog?.kind === "setup" ? dialog.pool ? "Edit stock setup" : "Configure stock item"
    : dialog?.kind === "move" ? "Record stock movement" : dialog?.kind === "close" ? "Physical count & daily closing" : "Opening preparation & stock";
  return <div className="inventory-workspace">
    <section className="inventory-day-header">
      <div><span className={`inventory-day-chip ${inventory.day ? "is-open" : ""}`}><span />{inventory.day ? "Stock day open" : inventory.lastClosedDate ? "Stock day closed" : "Opening not recorded"}</span>
        <h2>{inventory.day?.date || data.businessDate}</h2><p>{inventory.day ? `Opened by ${inventory.day.openedBy} · Counted quantities reserve automatically with orders.` : "Confirm preparation and carryover counts before selling counted items."}</p>
        <small>{stock.updatedAt ? `Updated ${new Date(stock.updatedAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka" })} · Refreshes every 15s` : "Loading live stock"}</small></div>
      <div className="inventory-header-actions"><button type="button" className="secondary" disabled={stock.busy} onClick={() => void stock.refresh()}><RefreshCw size={15} /> Refresh</button>
        {can("inventory:manage") && !inventory.day && <button type="button" className="primary" disabled={stock.busy || inventory.lastClosedDate === data.businessDate} onClick={() => setDialog({ kind: "open" })}><Sunrise size={16} />{inventory.lastClosedDate === data.businessDate ? "Closed for today" : "Open stock day"}</button>}
        {can("inventory:close") && inventory.day && <button type="button" className="secondary inventory-close-button" disabled={stock.busy} onClick={() => setDialog({ kind: "close" })}><Sunset size={16} /> Daily closing</button>}
        {can("inventory:manage") && <button type="button" className="primary" disabled={stock.busy} onClick={() => setDialog({ kind: "setup" })}><Plus size={16} /> Configure stock</button>}</div>
    </section>
    {stock.error && !dialog && <div className="form-error" role="alert">{stock.error}</div>}
    {stock.notice && <div className="inventory-success" role="status"><CheckCircle2 size={16} /> {stock.notice}</div>}
    <div className="inventory-summary-grid">{[
      { label: "Stock groups", value: inventory.pools.length, detail: `${counted.length} counted · ${inventory.pools.length - counted.length} availability only`, icon: PackageCheck },
      { label: "Running low", value: low, detail: "Prepare the next batch", icon: AlertTriangle },
      { label: "Sold out", value: soldOut, detail: "Unavailable for new orders", icon: Sunset },
      { label: "Open orders", value: data.pendingOrders, detail: "Resolve before daily closing", icon: ClipboardCheck },
    ].map((card) => <section className="panel inventory-summary" key={card.label}><div><small>{card.label}</small><strong>{card.value}</strong><p>{card.detail}</p></div><card.icon size={22} /></section>)}</div>
    <section className="panel"><div className="panel-title"><div><h3>Live food stock <span className="count-pill">{inventory.pools.length}</span></h3><p>Available = physical balance − reserved orders · Quantities remain in each item's own unit</p></div></div>
      <div className="filters"><SearchBox value={search} onChange={setSearch} /><select aria-label="Stock kitchen station" value={station} onChange={(event) => setStation(event.target.value)}>{["All stations", "Main Kitchen", "BBQ", "Drinks"].map((station) => <option key={station}>{station}</option>)}</select></div>
      <div className="table-scroll"><table><thead><tr><th>Stock item</th><th>Kitchen</th><th>Physical balance</th><th>Reserved</th><th>Available</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pools.map((pool) => {
        const amount = available(pool), out = pool.soldOut || (pool.mode === "counted" && amount <= 0), closed = pool.mode === "counted" && !inventory.day;
        return <tr key={pool.id}><td><strong>{pool.name}</strong><small className="item-note">{pool.links.map((link) => `${data.menu.find((item) => item.id === link.menuId)?.name || "Archived item"}${link.units > 1 ? ` ×${link.units}` : ""}`).join(" · ")}</small></td>
          <td>{pool.station}</td><td>{pool.mode === "counted" ? `${pool.onHand} ${pool.unit}` : "Availability only"}</td><td>{pool.mode === "counted" ? reserved(pool) : "—"}</td><td><strong>{pool.mode === "counted" ? `${amount} ${pool.unit}` : "Manual"}</strong></td>
          <td><span className={`badge ${closed || out ? "Cancelled" : "Ready"}`}>{closed ? "Day closed" : out ? "Sold out" : pool.mode === "counted" && amount <= pool.lowAt ? "Low stock" : "Available"}</span></td>
          <td><div className="inventory-row-actions">{can("inventory:operate") && <><button type="button" className="text-button" disabled={stock.busy}
            onClick={() => void stock.command({ action: "availability", poolId: pool.id, soldOut: !pool.soldOut })}>{pool.soldOut ? "Mark available" : "Mark sold out"}</button>
            {pool.mode === "counted" && <select aria-label={`Record movement for ${pool.name}`} value="" disabled={stock.busy || !inventory.day} onChange={(event) => { if (event.target.value) setDialog({ kind: "move", pool, action: event.target.value }); }}>
              <option value="">Stock movement…</option><option value="receive">Add preparation / delivery</option><option value="waste">Waste / spoilage</option><option value="staff_meal">Staff meal</option>{can("inventory:manage") && <option value="adjustment">Manager adjustment</option>}</select>}</>}
            {can("inventory:manage") && <button type="button" className="text-button" disabled={stock.busy} onClick={() => setDialog({ kind: "setup", pool })}>Edit setup</button>}</div></td></tr>;
      })}</tbody></table></div>
      {!pools.length && <p className="inventory-empty">{inventory.pools.length ? "No matching stock items." : "Start by configuring an item, such as Mug Dal. Then record its real opening quantity."}</p>}
    </section>
    {!!untracked.length && <section className="panel inventory-untracked"><div><h3>{untracked.length} menu items not tracked yet</h3><p>These keep normal menu availability. Use availability-only tracking for made-to-order foods, or group size variants into shared counted stock.</p></div>
      {can("inventory:manage") && <div className="inventory-link-add"><select aria-label="Menu item to track" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Choose a menu item…</option>{untracked.map((item) => <option key={item.id} value={item.id}>{item.nameBn ? `${item.nameBn} · ` : ""}{item.name} · {item.category}</option>)}</select>
        <button type="button" className="secondary" disabled={!selected || stock.busy} onClick={() => setDialog({ kind: "setup", menuId: selected })}><Plus size={15} /> Track item</button></div>}</section>}
    <StockHistory history={data.history} closings={data.closings} />
    {dialog && <InventoryDialog title={title} error={stock.error} busy={stock.busy} onClose={close}>
      {dialog.kind === "setup" && <StockPoolForm key={dialog.pool?.id || dialog.menuId || "new"} pool={dialog.pool} initialMenuId={dialog.menuId} pools={inventory.pools} menu={data.menu} command={stock.command} busy={stock.busy} onDone={finish} />}
      {dialog.kind === "move" && <StockMovementForm pool={dialog.pool} action={dialog.action} command={stock.command} busy={stock.busy} onDone={finish} />}
      {(dialog.kind === "open" || dialog.kind === "close") && <StockDayForm data={data} closing={dialog.kind === "close"} command={stock.command} busy={stock.busy} onDone={finish} />}
    </InventoryDialog>}
  </div>;
}
