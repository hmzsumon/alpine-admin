/* ────────── authenticated stock I/O ────────── */
import type { InventoryView } from "@/types/inventory";
async function result(response: Response): Promise<InventoryView> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Stock request failed. Please retry.");
  return body;
}
export function loadInventory() { return fetch("/api/inventory", { cache: "no-store" }).then(result); }
export function changeInventory(input: Record<string, unknown>, requestId: string) {
  return fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, requestId }) }).then(result);
}
