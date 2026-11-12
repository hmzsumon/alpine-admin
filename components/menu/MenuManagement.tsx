/* ── Component: MenuManagement ────────────────────────────────────────────── */
"use client";
import SearchableSelect from "@/components/ui/SearchableSelect";


/* ────────── imports ────────── */
import { useState } from "react";
import MenuImportPanel from "./MenuImportPanel";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminContext } from "@/context/AdminContext";
import { Plus, Trash2, FileSpreadsheet } from "lucide-react";
import CategoryManagement from "./CategoryManagement";
import { money } from "@/utils/format";
import SearchBox from "@/components/ui/SearchBox";
import Empty from "@/components/ui/EmptyState";
import MenuImage from "@/components/menu/MenuImage";
import MenuItemName from "@/components/menu/MenuItemName";

export default function MenuManagement() {
  const { can } = useAuth();
  const [showImport, setShowImport] = useState(false);
  /* ────────── workspace state ────────── */
  const {
    data,
    search,
    setSearch,
    category,
    setCategory,
    setModal,
    setEditing,
    categories,
    filteredMenu,
    save, busy, mode, setNotice, stationName,
  } = useAdminContext();

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h3>
            Menu library <span className="count-pill">{data.menu.length}</span>
          </h3>
          <p>Prices in BDT · Routing can be changed per item</p>
        </div>
        <div className="menu-actions">
        {can("menu:manage") && <button type="button" className="secondary" disabled={busy || showImport || mode !== "database"} onClick={() => setShowImport(true)}><FileSpreadsheet size={16}/>Excel Import / Update</button>}
        <button className="secondary" disabled={!can("menu:manage")}
          onClick={() => setModal("category")}>
          <Plus size={16} /> Add category
        </button>
        <button
          className="primary"
          disabled={!can("menu:manage")}
          onClick={() => {
            setEditing(null);
            setModal("menu");
          }}
        >
          <Plus size={16} /> Add item
        </button>
        </div>
      </div>
      {showImport && <MenuImportPanel close={() => setShowImport(false)} />}
      <CategoryManagement />
      <div className="filters">
        <SearchBox value={search} onChange={setSearch} />
        <SearchableSelect
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SearchableSelect>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Item name</th>
              <th>কোড</th>
              <th>Category</th>
              <th>Kitchen station</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredMenu.map((i) => (
              <tr key={i.id}>
                <td>
                  <div className="menu-item-identity">
                  <MenuImage src={i.imageUrl} name={i.name} />
                  <div>
                  <MenuItemName item={i} />
                  {!i.nameBn && <small className="item-note amber-text">বাংলা নাম যোগ করুন</small>}
                  {i.note && <small className="item-note">{i.note}</small>}
                  </div>
                  </div>
                </td>
                <td><strong className="item-code-badge">{i.code || "—"}</strong>{i.codeNote && <small className="item-note amber-text" title={i.codeNote}>কোডের নোট দেখুন — Edit</small>}</td>
                <td>{i.category}</td>
                <td>
                  <span className="station-tag">{stationName(i.station)}</span>
                </td>
                <td>
                  {i.price === null ? (
                    <span className="amber-text">Unconfirmed</span>
                  ) : (
                    money(i.price)
                  )}
                </td>
                <td>
                  <span className={`badge ${i.active && data.stockSummary?.[i.id]?.available !== false ? "Ready" : "Cancelled"}`}>
                    {!i.active ? "Disabled" : data.stockSummary?.[i.id]?.available === false ? "Unavailable" : "Available"}
                  </span>
                  {data.stockSummary?.[i.id]?.tracked && <small className="item-note">{data.stockSummary[i.id].available
                    ? data.stockSummary[i.id].quantity === null ? "Kitchen available" : `${data.stockSummary[i.id].quantity} remaining`
                    : data.stockSummary[i.id].reason}</small>}
                </td>
                <td>
                  <div className="resource-actions">
                  <button
                    className="text-button"
                    disabled={!can("menu:manage")}
                    onClick={() => {
                      setEditing(i);
                      setModal("menu");
                    }}
                  >
                    Edit
                  </button>
                  {can("menu:manage") && <button type="button" className="text-button danger-text" disabled={busy || mode !== "database"} onClick={async () => {
                    if (!window.confirm(`“${i.nameBn || i.name}” ডিলিট করবেন? পুরোনো অর্ডার ও স্টকের ইতিহাস থাকবে। চলমান অর্ডার থাকলে আগে শেষ করতে হবে।`)) return;
                    if (await save({ ...data, menu: data.menu.filter((item) => item.id !== i.id) })) setNotice("আইটেম ডিলিট হয়েছে। পুরোনো অর্ডারের হিসাব সংরক্ষিত আছে।");
                  }}><Trash2 size={14} /> ডিলিট</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredMenu.length && <Empty text="No items match your search." />}
      </div>
    </section>
  );
}
