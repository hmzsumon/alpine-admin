/* ── Component: SetupDialog ──────────────────────────────────────────── */
"use client";
import { useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
export default function SetupDialog({ title, busy, close, children }: { title: string; busy: boolean; close: () => void; children: ReactNode }) {
  const dismiss = useCallback(() => { if (!busy) close(); }, [busy, close]);
  useDialogFocus("setup", dismiss);
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="setup-title"><div className="panel-title"><h3 id="setup-title">{title}</h3><button type="button" className="icon-button" disabled={busy} aria-label="বন্ধ করুন" onClick={dismiss}><X size={20} /></button></div>{children}</section></div>;
}
