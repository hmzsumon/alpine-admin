/* ────────── imports ────────── */
import { useEffect } from "react";

/* ────────── dialog keyboard navigation ────────── */
export function useDialogFocus(modal: string | null, onClose: () => void) {
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const selector =
      "button:not(:disabled), input:not(:disabled), select:not(:disabled)";
    dialog?.querySelector<HTMLElement>(selector)?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const controls = Array.from(
          dialog?.querySelectorAll<HTMLElement>(selector) || []
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [modal, onClose]);
}
