/* ── Component: InventoryDialog ───────────────────────────────────────── */
"use client";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
export default function InventoryDialog({ title, busy, error, onClose, children }: {
  title: string; busy: boolean; error: string; onClose: () => void; children: ReactNode;
}) {
  useDialogFocus("inventory", onClose);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="inventory-dialog-title" className="modal wide inventory-dialog">
      <div className="panel-title"><div><h3 id="inventory-dialog-title">{title}</h3><p>All stock changes are recorded with staff and time.</p></div>
        <button type="button" className="icon-button" aria-label="Close stock dialog" disabled={busy} onClick={onClose}><X size={19} /></button></div>
      {error && <p className="form-error inventory-dialog-error" role="alert">{error}</p>}
      {children}
    </section>
  </div>;
}
