/* ────────── backwards-compatible defaults until a workspace is configured ────────── */
import type { RestaurantTable, Kitchen } from "@/types";
export const defaultTables: RestaurantTable[] = Array.from({ length: 24 }, (_, i) => ({ id: `T-${String(i + 1).padStart(2, "0")}`, name: `T-${String(i + 1).padStart(2, "0")}`, floor: i < 12 ? "Ground floor" : "Second floor", seats: 4 }));
export const defaultKitchens: Kitchen[] = ["Main Kitchen", "BBQ", "Drinks"].map((id, i) => ({ id, name: id, floor: i === 0 ? "Ground floor" : "Second floor" }));
