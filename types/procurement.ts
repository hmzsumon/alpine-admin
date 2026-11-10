/* ────────── independent purchasing and raw-material contracts; quantities in thousandths, money in poisha ────────── */
export type RawUnit = "kg" | "piece" | "liter" | "gram" | "portion" | "pack";
export interface RawSupplier {
  id: string;
  version: number;
  name: string;
  contact: string;
  phone: string;
  address: string;
  kinds: string[];
  bkash: string;
  note: string;
  opening: number;
  active: boolean;
}
export interface RawProduct {
  id: string;
  version: number;
  code: string;
  name: string;
  category: string;
  unit: RawUnit;
  stage: "raw" | "processed" | "cooked" | "supply";
  active: boolean;
}
export interface RawLocation {
  id: string;
  version: number;
  name: string;
  kind: "store" | "freezer" | "kitchen";
  active: boolean;
}
export interface RawCatalog {
  suppliers: RawSupplier[];
  products: RawProduct[];
  locations: RawLocation[];
  lastClosedDate: string | null;
}
export interface RawLot {
  _id: string;
  productId: string;
  supplierId?: string;
  receiptId?: string;
  receiptLine?: number;
  sourceRecord: string;
  batch: string;
  date: string;
  weight?: number;
  pieces?: number;
  note: string;
}
export interface RawBalance {
  _id: string;
  lotId: string;
  locationId: string;
  quantity: number;
}
export interface RawRecord {
  _id: string;
  kind: string;
  no: string;
  actor: string;
  actorId: string;
  at: string;
  date: string;
  hash: string;
  data: any;
}

export interface RawView {
  catalog: RawCatalog;
  revision: number;
  date: string;
  balances: RawBalance[];
  lots: RawLot[];
  records: RawRecord[];
  pending: RawRecord[];
  demands: RawRecord[];
  recordCount: number;
  totals: {
    supplierId: string;
    balance: number;
    purchases: number;
    payments: number;
  }[];
}
export type RawCommand = (
  action: string,
  payload: Record<string, unknown>,
) => Promise<boolean>;
