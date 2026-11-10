/* ────────── generated reviewed default; unknown/ambiguous prices remain unavailable ────────── */
import type {AppData,MenuItem} from "@/types";
import defaultMenu from "./defaultMenu.json";
import {defaultKitchens,defaultTables} from "@/config/restaurantSetup";
export const menu:MenuItem[]=structuredClone(defaultMenu) as MenuItem[];
export function initialData(): AppData {
  return {
    menu: structuredClone(menu),
    categories: [...new Set(menu.map(m=>m.category))],
    kitchens: structuredClone(defaultKitchens), tables: structuredClone(defaultTables),
    inventory: { pools: [], allocations: [], day: null, lastClosedDate: null },
    orders: [],
    expenses: [],
    printers: [
      {
        id: "main",
        name: "Main Kitchen",
        floor: "Ground floor",
        station: "Main Kitchen",
        ip: "",
        enabled: false,
      },
      {
        id: "bbq",
        name: "BBQ Kitchen",
        floor: "Second floor",
        station: "BBQ",
        ip: "",
        enabled: false,
      },
      {
        id: "drinks",
        name: "Drinks & Dessert",
        floor: "Second floor",
        station: "Drinks",
        ip: "",
        enabled: false,
      },
      {
        id: "cash",
        name: "Cash Counter",
        floor: "Cash counter",
        station: "Cash Counter",
        ip: "",
        enabled: false,
      },
    ],
  };
}
