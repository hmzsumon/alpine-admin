/* ────────── shared contracts between the seven small workspace panels ────────── */
import type { RawView, RawCommand } from "@/types/procurement";
export interface RawPanelProps {
  data: RawView;
  search: string;
  manage: boolean;
  pay: boolean;
  operate: boolean;
  canClose: boolean;
  busy: boolean;
  command: RawCommand;
  open: (type: string, extra?: Record<string, unknown>) => void;
  details: (id: string) => void;
}
