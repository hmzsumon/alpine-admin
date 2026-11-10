/* ────────── imports ────────── */
import {
  BookOpen,
  Flame,
  LayoutDashboard,
  Printer,
  ShoppingBag,
  Table2,
  Wallet,
  Users,
  ShieldCheck,
  PackageCheck,
  Warehouse,
  CircleHelp,
} from "lucide-react";
import type { Station } from "@/types";

/* ────────── navigation ────────── */
export const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Menu & categories", href: "/menu", icon: BookOpen },
  { name: "ক্রয় ও স্টোর", href: "/procurement", icon: Warehouse },
  { name: "Stock & daily closing", href: "/inventory", icon: PackageCheck },
  { name: "Tables & floors", href: "/tables", icon: Table2 },
  { name: "Kitchen & KOT", href: "/kitchen", icon: Flame },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Printers", href: "/printers", icon: Printer },
  { name: "Staff & permissions", href: "/users", icon: Users },
  { name: "My account", href: "/profile", icon: ShieldCheck },
  { name: "নির্দেশিকা", href: "/guide", icon: CircleHelp },
];

/* ────────── kitchen stations ────────── */
export const stations: Station[] = ["Main Kitchen", "BBQ", "Drinks"];
export const storageKey = "alpine-admin-demo-v1";

/* ────────── page descriptions ────────── */
export const heading: Record<string, string> = {
  "নির্দেশিকা": "রেস্টুরেন্ট পরিচালনার প্রতিটি কাজ শিখুন সহজ বাংলা ও উদাহরণে।",
  "ক্রয় ও স্টোর": "ব্যাপারী, চাহিদা, বিল, পেমেন্ট ও কাঁচামালের স্বতন্ত্র হিসাব।",
  Overview: "Your restaurant, at a glance.",
  Orders: "Every order. One place.",
  "Menu & categories": "A menu made for every craving.",
  "Stock & daily closing": "From opening preparation to a balanced closing.",
  "Tables & floors": "Make room for great moments.",
  "Kitchen & KOT": "Keep every kitchen in sync.",
  Expenses: "Know where every taka goes.",
  Printers: "The right ticket. The right kitchen.",
  "Staff & permissions": "The right access for every team member.",
  "My account": "Your profile and account security.",
};
