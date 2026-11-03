/* ────────── shared contracts ────────── */
import type { Inventory, StockAvailability } from "@/types/inventory";
export type Station = string;
export type RestaurantTable = { id: string; name: string; floor: string; seats: number };
export type Kitchen = { id: string; name: string; floor: string };
export type MenuItem = {
  nameBn?: string;
  imageUrl?: string;
  id: string;
  name: string;
  category: string;
  station: Station;
  price: number | null;
  active: boolean;
  note?: string;
};
export type Order = {
  cancelReason?: string;
  cancelPrepared?: boolean;
  id: string;
  table: string;
  waiter: string;
 createdBy?:string;
  createdAt: string;
  status: "New" | "Preparing" | "Ready" | "Paid" | "Cancelled";
  items: {
    menuId: string;
    name: string;
    nameBn?: string;
    quantity: number;
    price: number;
 note?:string;
    station: Station;
  }[];
};
export type Printer = {
  id: string;
  name: string;
  floor: string;
  station: Station | "Cash Counter";
  ip: string;
  enabled: boolean;
};
export type AppData = {
  tables?: RestaurantTable[];
  kitchens?: Kitchen[];
  retiredTableIds?: string[];
  retiredKitchenIds?: string[];
  inventory?: Inventory;
  stockSummary?: Record<string, StockAvailability>;
  categories?: string[];
  menu: MenuItem[];
  orders: Order[];
  printers: Printer[];
  expenses: { id: string; name: string; amount: number; date: string }[];
};
