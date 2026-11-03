/* ── Component: MenuItemForm ────────────────────────────────────────────── */
"use client";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { useRef, useState } from "react";
import MenuImagePicker from "@/components/menu/MenuImagePicker";

import type { MenuItem, Station } from "@/types";


export default function MenuItemForm() {
  /* ────────── workspace state ────────── */
  const { data, setNotice, setModal, editing, busy, save, categories, category, kitchens } =
    useAdminContext();
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const committed = useRef(false);
  const savedImageUrl = data.menu.find((item) => item.id === editing?.id)?.imageUrl || "";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (uploading) return;
        const f = new FormData(e.currentTarget);
        const priceText = String(f.get("price")).trim();
        const price = priceText === "" ? null : Number(priceText);
        if (price !== null && (!Number.isFinite(price) || price < 0)) {
          setNotice("Enter a valid price");
          return;
        }
        const item: MenuItem = {
          imageUrl,
          id: editing?.id || crypto.randomUUID(),
          name: String(f.get("name")).trim(),
          nameBn: String(f.get("nameBn")).trim(),
          category: String(f.get("category")).trim(),
          station: f.get("station") as Station,
          price,
          active: f.get("active") === "on",
          note: String(f.get("note")).trim(),
        };
        if (!item.name || !item.nameBn || !/[\u0980-\u09ff]/.test(item.nameBn) || !item.category) {
          setNotice("English name, Bengali name (বাংলা) and category are required");
          return;
        }
        if (item.active && price === null) {
          setNotice("Confirm the price before enabling an item");
          return;
        }
        if (
          await save({
            ...data,
            menu: editing
              ? data.menu.map((i) => (i.id === editing.id ? item : i))
              : [...data.menu, item],
          })
        ) {
          committed.current = true;
          setModal(null);
          setNotice("Menu item saved");
        }
      }}
    >
      <MenuImagePicker value={imageUrl} onChange={setImageUrl}
        uploading={uploading} setUploading={setUploading} disabled={busy}
        committed={committed} savedImageUrl={savedImageUrl}
        onRemoveSaved={async () => {
          if (!editing) return true;
          return save({ ...data, menu: data.menu.map((item) =>
            item.id === editing.id ? { ...item, imageUrl: "" } : item) });
        }} />
      <label>
        Item name (English) *
        <input required name="name" maxLength={200} defaultValue={editing?.name} placeholder="e.g. Mug Dal" lang="en" />
      </label>
      <label>আইটেমের বাংলা নাম *<input required name="nameBn" maxLength={200} defaultValue={editing?.nameBn} placeholder="যেমন: মুগ ডাল" lang="bn" />
        <small className="item-note">ওয়েটারের অ্যাপে এই নামটি বড় করে দেখাবে। English name-ও রাখা হবে।</small></label>
      <div className="form-grid">
        <label>
          Category *
          <input
            list="categories"
            required
            name="category"
            defaultValue={editing?.category || (category === "All categories" ? "" : category)}
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Price (BDT)
          <input
            type="number"
            min="0"
            step="0.01"
            name="price"
            defaultValue={editing?.price ?? ""}
          />
        </label>
      </div>
      <label>
        Kitchen station *
        <select
          name="station"
          defaultValue={editing?.station || kitchens[0]?.id || ""}
        >
          {kitchens.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <label>
        Internal note
        <input name="note" defaultValue={editing?.note} />
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          name="active"
          defaultChecked={editing?.active ?? true}
        />{" "}
        Available for ordering
      </label>
      <button disabled={busy || uploading} className="primary" type="submit">
        {busy ? "Saving…" : "Save item"}
      </button>
    </form>
  );
}
