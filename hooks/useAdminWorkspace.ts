/* ────────── imports ────────── */
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "@/config/admin";
import { initialData } from "@/data/menu";
import { loadWorkspace, persistWorkspace } from "@/lib/adminWorkspace";
import { total, paidOrder } from "@/utils/format";
import type { AppData, MenuItem, Order } from "@/types";
import { defaultTables, defaultKitchens } from "@/config/restaurantSetup";
import { matchesMenuSearch, normalizeItemCode } from "@/utils/menuSearch";

/* ────────── workspace state and actions ────────── */
export function useAdminWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const page =
    navigation.find((item) => item.href === pathname || pathname.startsWith(item.href + "/"))?.name || "Overview";

  const [data, setData] = useState<AppData>(initialData);
  const tables = data.tables ?? defaultTables;
  const kitchens = data.kitchens ?? defaultKitchens;
  const stationName = (id: string) => kitchens.find((k) => k.id === id)?.name || id;
  const [revision, setRevision] = useState(0);
  const readVersion = useRef(0);

  const [mode, setMode] = useState("loading");

  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All categories");

  const [drawer, setDrawer] = useState(false);

  const [modal, setModal] = useState<"menu" | "category" | "order" | "expense" | "cancel-order" | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const [editing, setEditing] = useState<MenuItem | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});

  const [floor, setFloor] = useState("All floors");

  const [range, setRange] = useState("Today");

  const [busy, setBusy] = useState(false);

  /* ────────── load workspace ────────── */
  useEffect(() => {
    let alive = true;
    const version = ++readVersion.current;
    loadWorkspace()
      .then((result) => {
        if (alive && version === readVersion.current) {
          setData(result.data);
          setRevision(result.revision);
          setMode(result.mode);
        }
      })
      .catch((error) => {
        if (alive && version === readVersion.current) {
          setMode("error");
          setNotice(error.message);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5500);
    return () => clearTimeout(timer);
  }, [notice]);

  /* ────────── persist explicit changes ────────── */
  async function refreshWorkspace() {
    const version = ++readVersion.current;
    const result = await loadWorkspace();
    if (version === readVersion.current) { setData(result.data); setRevision(result.revision); setMode(result.mode); }
  }
  // Refresh live availability without replacing a form's in-progress edits.
  useEffect(() => {
    if (modal || busy) return;
    let alive = true;
    const timer = setInterval(() => { const version = ++readVersion.current; void loadWorkspace().then((result) => {
      if (alive && version === readVersion.current) { setData(result.data); setRevision(result.revision); setMode(result.mode); }
    }).catch(() => {}); }, 15000);
    return () => { alive = false; clearInterval(timer); };
  }, [modal, busy]);
  async function save(next: AppData) {
    if (mode === "loading" || mode === "error" || busy) return false;
    readVersion.current++;
    setBusy(true);
    try {
      const result = await persistWorkspace(next, data, revision);
      setData(result.data);
      setRevision(result.revision);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save");
      return false;
    } finally {
      setBusy(false);
    }
  }

  // Include empty saved categories while retaining the original menu categories.
  const categories = Array.from(new Map(
    [...(data.categories || []), ...data.menu.map((i) => i.category)]
      .map((name) => [name.toLowerCase(), name])
  ).values());

  const filteredMenu = data.menu.filter(
    (i) =>
      (category === "All categories" || i.category === category || (i.code && i.code === normalizeItemCode(search.replace(/^(?:কোড|code)\s*/i, "")))) &&
      matchesMenuSearch(i, search)
  ).sort((a, b) => (a.code || "999999").localeCompare(b.code || "999999", "en", { numeric: true }));

  const orders = data.orders.filter((o) =>
    `${o.id} ${o.table} ${o.parcelToken || ""} ${o.customerName || ""} ${o.customerPhone || ""} ${o.waiter}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const active = data.orders.filter(
    (o) => !["Paid", "Cancelled"].includes(o.status)
  );

  const periodOrders = data.orders.filter((o) => {
    const age = Date.now() - new Date(o.createdAt).getTime();
    return range === "Today"
      ? new Date(o.createdAt).toLocaleDateString("en-CA", {
          timeZone: "Asia/Dhaka",
        }) ===
          new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })
      : age < 7 * 86400000;
  });

  const paid = periodOrders.filter((o) => paidOrder(o) && o.status !== "Cancelled");

  const sales = paid.reduce((s, o) => s + total(o), 0);

  const expense = data.expenses
    .filter((e) =>
      range === "Today"
        ? e.date ===
          new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })
        : Date.now() - new Date(e.date).getTime() < 7 * 86400000
    )
    .reduce((s, e) => s + e.amount, 0);

  const chart = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 86400000);
        const day = date.toLocaleDateString("en-CA", {
          timeZone: "Asia/Dhaka",
        });
        return {
          day: date.toLocaleDateString("en", {
            weekday: "short",
            timeZone: "Asia/Dhaka",
          }),
          sales: data.orders
            .filter(
              (o) =>
                paidOrder(o) && o.status !== "Cancelled" &&
                new Date(o.createdAt).toLocaleDateString("en-CA", {
                  timeZone: "Asia/Dhaka",
                }) === day
            )
            .reduce((s, o) => s + total(o), 0),
        };
      }),
    [data.orders]
  );

  function navigate(name: string) {
    const destination = navigation.find((item) => item.name === name);
    if (destination) router.push(destination.href);
    setSearch("");
    setCategory("All categories");
    setDrawer(false);
  }

  function exportOrders() {
    const csv =
      "Order,Table,Waiter,Status,Total,Type,Parcel token,Packing charge,Payment\n" +
      data.orders
        .map((o) =>
          [
            o.id,
            o.table,
            `"${
              (/^[=+@\-\t\r]/.test(o.waiter) ? "'" : "") +
              o.waiter.replaceAll('"', '""')
            }"`,
            o.status,
            total(o), o.orderType === "takeaway" ? "takeaway" : o.items.some((l) => l.fulfillment === "parcel") ? "mixed" : "dine_in", o.parcelToken || "", o.packingCharge || 0, paidOrder(o) ? "Paid" : "Unpaid",
          ].join(",")
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "alpine-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Orders exported");
  }

  async function status(id: string, value: Order["status"]) {
    if (value === "Cancelled") { setCancelOrderId(id); setModal("cancel-order"); return; }
    await save({
      ...data,
      orders: data.orders.map((o) =>
        o.id === id ? { ...o, status: value } : o
      ),
    });
  }
  async function cancelOrder(id: string, reason: string, prepared: boolean) {
    const saved = await save({ ...data, orders: data.orders.map((order) => order.id === id
      ? { ...order, status: "Cancelled", cancelReason: reason, cancelPrepared: prepared } : order) });
    if (saved) { setModal(null); setCancelOrderId(null); setNotice("Order cancelled. Stock was released or recorded as waste."); }
    return saved;
  }

  const openOrder = (table?: string, existingId?: string) => {
    setAppendOrderId(existingId || null);
    setCart({});
    setSearch("");
    setModal("order");
    setOrderTable(table || tables[0]?.id || "");
  };

  const [appendOrderId, setAppendOrderId] = useState<string | null>(null);
  const [orderTable, setOrderTable] = useState("T-01");
  return {
    appendOrderId,
    tables,
    kitchens,
    stationName,
    paid,
    page,
    data,
    mode,
    notice,
    setNotice,
    search,
    setSearch,
    category,
    setCategory,
    drawer,
    setDrawer,
    modal,
    setModal,
    editing,
    setEditing,
    cart,
    setCart,
    floor,
    setFloor,
    range,
    setRange,
    busy,
    save,
    refreshWorkspace,
    cancelOrderId,
    cancelOrder,
    categories,
    filteredMenu,
    orders,
    active,
    sales,
    expense,
    chart,
    navigate,
    exportOrders,
    status,
    openOrder,
    orderTable,
    setOrderTable,
  };
}
