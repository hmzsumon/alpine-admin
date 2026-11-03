/* ────────── inventory state, polling and retry-safe commands ────────── */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadInventory, changeInventory } from "@/lib/inventory";
import { useAdminContext } from "@/context/AdminContext";
import type { InventoryView } from "@/types/inventory";
export function useInventory() {
  const [data, setData] = useState<InventoryView | null>(null), [error, setError] = useState("");
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const pending = useRef<{ payload: string; id: string } | null>(null), active = useRef(false), alive = useRef(true);
  const readVersion = useRef(0);
  const { refreshWorkspace } = useAdminContext();
  const refresh = useCallback(async () => {
    if (active.current) return;
    const version = ++readVersion.current;
    try { const result = await loadInventory(); if (alive.current && !active.current && version === readVersion.current) { setData(result); setUpdatedAt(Date.now()); setError(""); } }
    catch (error) { if (alive.current && version === readVersion.current) setError(error instanceof Error ? error.message : "Unable to load stock"); }
  }, []);
  useEffect(() => { alive.current = true; void refresh(); const timer = setInterval(() => void refresh(), 15000);
    return () => { alive.current = false; clearInterval(timer); }; }, [refresh]);
  async function command(input: Record<string, unknown>) {
    if (active.current) return false;
    readVersion.current++;
    active.current = true; setBusy(true); setError(""); setNotice("");
    const payload = JSON.stringify(input);
    if (pending.current?.payload !== payload) pending.current = { payload, id: crypto.randomUUID() };
    try {
      const result = await changeInventory(input, pending.current!.id);
      pending.current = null;
      if (alive.current) { setData(result); setUpdatedAt(Date.now()); setNotice("Stock updated and recorded."); }
      void refreshWorkspace().catch(() => {});
      return true;
    } catch (error) { if (alive.current) setError(error instanceof Error ? error.message : "Unable to save stock"); return false; }
    finally { active.current = false; if (alive.current) setBusy(false); }
  }
  return { data, error, busy, notice, updatedAt, refresh, command };
}
