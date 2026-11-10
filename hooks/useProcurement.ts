/* ────────── polling + idempotent command retries confined to the independent module ────────── */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { rawRequest } from "@/lib/procurement";
import type { RawView, RawCommand } from "@/types/procurement";
export function useProcurement(paused: boolean) {
  const [data, setData] = useState<RawView>(),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const working = useRef(false),
    alive = useRef(true),
    pause = useRef(paused),
    pending = useRef<{ payload: string; id: string }>();
  pause.current = paused;
  const refresh = useCallback(async () => {
    if (working.current) return;
    try {
      const d = await rawRequest("view");
      if (alive.current && !working.current) {
        setData(d);
        setError("");
      }
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : "তথ্য পাওয়া যায়নি।");
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    void refresh();
    const timer = setInterval(() => {
      if (!pause.current) void refresh();
    }, 30000);
    return () => {
      alive.current = false;
      clearInterval(timer);
    };
  }, [refresh]);
  const command: RawCommand = async (action, payload) => {
    if (working.current) return false;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const serialized = JSON.stringify({ action, payload });
    if (pending.current?.payload !== serialized)
      pending.current = { payload: serialized, id: crypto.randomUUID() };
    try {
      const result = await rawRequest("command", {
        action,
        payload,
        requestId: pending.current!.id,
      });
      pending.current = undefined;
      if (alive.current)
        setNotice("সেভ হয়েছে। রেফারেন্স: " + (result.no || result.id));
      try {
        const d = await rawRequest("view");
        if (alive.current) setData(d);
      } catch {
        if (alive.current)
          setError("সেভ হয়েছে; সর্বশেষ তালিকা পেতে রিফ্রেশ করুন।");
      }
      return true;
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : "সেভ হয়নি।");
      return false;
    } finally {
      working.current = false;
      if (alive.current) setBusy(false);
    }
  };
  return { data, error, notice, busy, refresh, command, setNotice, setError };
}
