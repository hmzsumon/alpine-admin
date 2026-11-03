/* ── Component: StockPoolForm ──────────────────────────────────────────── */
"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAdminContext } from "@/context/AdminContext";
import type { MenuItem } from "@/types";
import type { StockCommand, StockPool } from "@/types/inventory";
export default function StockPoolForm({ pool, pools, menu, initialMenuId, command, busy, onDone }: {
  pool?: StockPool; pools: StockPool[]; menu: MenuItem[]; initialMenuId?: string;
  command: StockCommand; busy: boolean; onDone: () => void;
}) {
  const { kitchens } = useAdminContext();
  const item = menu.find((item) => item.id === initialMenuId);
  const [links, setLinks] = useState(pool?.links || (item ? [{ menuId: item.id, units: 1 }] : []));
  const [selected, setSelected] = useState("");
  const [mode, setMode] = useState(pool?.mode || "counted");
  const used = new Set(pools.filter((row) => row.id !== pool?.id).flatMap((row) => row.links.map((link) => link.menuId)));
  const choices = menu.filter((item) => !used.has(item.id) && !links.some((link) => link.menuId === item.id));
  return <form onSubmit={async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (await command({ action: "configure", pool: { ...(pool ? { id: pool.id, version: pool.version } : {}),
      name: String(form.get("name")).trim(), station: form.get("station"), unit: String(form.get("unit")).trim(),
      mode, lowAt: Number(form.get("lowAt")), links } })) onDone();
  }}>
    <div className="form-grid">
      <label>Stock group name *<input name="name" required minLength={3} maxLength={100} defaultValue={pool?.name || item?.name} placeholder="e.g. Mug Dal" /></label>
      <label>Kitchen station<select name="station" defaultValue={pool?.station || item?.station || kitchens[0]?.id || ""}>{kitchens.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></label>
      <label>Tracking mode<select value={mode} onChange={(event) => setMode(event.target.value as StockPool["mode"])}><option value="counted">Count portions / pieces / bottles</option><option value="availability">Available / Sold out only</option></select></label>
      <label>Stock unit *<input required name="unit" maxLength={30} defaultValue={pool?.unit || "portion"} placeholder="portion, piece, bottle, half grill" /></label>
    </div>
    <label>Low-stock alert at<input name="lowAt" type="number" required min={0} max={1000000} step={1} defaultValue={pool?.lowAt ?? 3} /></label>
    <div className="inventory-help">Use one shared group for variants of the same food. Example: half grill uses 1 stock unit, full grill uses 2. Counted groups start at zero; enter real quantities when opening the day.</div>
    <div className="inventory-link-add"><select aria-label="Choose linked menu item" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Choose a menu item…</option>{choices.map((item) => <option key={item.id} value={item.id}>{item.nameBn ? `${item.nameBn} · ` : ""}{item.name} · {item.category}</option>)}</select>
      <button type="button" className="secondary" disabled={!selected || busy} onClick={() => { setLinks([...links, { menuId: selected, units: 1 }]); setSelected(""); }}><Plus size={15} /> Link item</button></div>
    <div className="inventory-linked-items">{links.map((link) => <div key={link.menuId}><span>{menu.find((item) => item.id === link.menuId)?.name || link.menuId}</span>
      <label>Units per item<input aria-label={`Stock units for ${menu.find((item) => item.id === link.menuId)?.name}`} type="number" min={1} max={1000} step={1} required value={link.units}
        onChange={(event) => setLinks(links.map((row) => row.menuId === link.menuId ? { ...row, units: Number(event.target.value) } : row))} /></label>
      <button type="button" className="icon-button" aria-label="Unlink menu item" onClick={() => setLinks(links.filter((row) => row.menuId !== link.menuId))}><X size={15} /></button></div>)}</div>
    {!links.length && <p className="inventory-help">Link at least one menu item to continue.</p>}
    <button type="submit" className="primary" disabled={busy || !links.length}>{busy ? "Saving…" : "Save stock setup"}</button>
  </form>;
}
