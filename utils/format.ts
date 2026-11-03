/* ────────── imports ────────── */
import type { Order } from "@/types";

/* ────────── currency and order totals ────────── */
export const money = (value: number) => `৳${value.toLocaleString("en-BD")}`;
export const total = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
