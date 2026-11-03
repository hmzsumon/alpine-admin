/* ────────── imports ────────── */
import type { AppData } from "@/types";
export type WorkspaceResult = {
  data: AppData;
  revision: number;
  mode: "database";
};
/* ────────── authenticated MongoDB workspace ────────── */
export async function loadWorkspace(): Promise<WorkspaceResult> {
  const response = await fetch("/api/state", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Could not load restaurant data");
  return { ...result, mode: "database" };
}
/* ────────── send only changed collections with a concurrency revision ────────── */
export async function persistWorkspace(
  next: AppData,
  previous: AppData,
  revision: number
): Promise<WorkspaceResult> {
  const changes: Partial<AppData> = {};
  for (const key of ["categories", "menu", "orders", "expenses", "printers"] as const) {
    if (JSON.stringify(next[key]) !== JSON.stringify(previous[key]))
      Object.assign(changes, { [key]: next[key] });
  }
  if (!Object.keys(changes).length)
    return { data: next, revision, mode: "database" };
  const response = await fetch("/api/state", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes, revision }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to save");
  return { ...result, mode: "database" };
}
