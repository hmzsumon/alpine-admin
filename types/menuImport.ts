/* ────────── editable import rows and deterministic preview results ────────── */
export interface MenuImportRow { key: string; sheet: string; row: number; code: string; name: string; nameBn: string; price: string; category: string; station: string; active: string; aliases: string; note: string; codeNote: string; itemId: string; targetId?: string; include?: boolean; }
export interface MenuImportInput { importId: string; fileName: string; rows: MenuImportRow[]; defaultCategory: string; defaultStation: string; }
export interface MenuImportReview { key: string; row: number; action: "add" | "update" | "unchanged" | "skip" | "error"; targetId?: string; code?: string; name?: string; nameBn?: string; price?: number | null; category?: string; station?: string; active?: boolean; before?: { code?: string; name: string; nameBn?: string; price: number | null }; changes: string[]; issues: string[]; warnings: string[]; candidates: string[]; }

export interface MenuImportPreview { reviews: MenuImportReview[]; summary: { added: number; updated: number; unchanged: number; skipped: number; blocked: number }; token: string | null; revision: number; }
