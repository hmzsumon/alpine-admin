/* ────────── authenticated staff contracts ────────── */
export type Role =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "kitchen"
  | "waiter";
export type Permission =
  | "workspace:read"
  | "workspace:replace"
  | "overview:read"
  | "menu:read"
  | "menu:manage"
  | "procurement:read" | "procurement:manage" | "procurement:pay" | "procurement:operate" | "procurement:close"
  | "inventory:read"
  | "inventory:operate"
  | "inventory:manage"
  | "inventory:close"
  | "orders:read"
  | "orders:create"
  | "orders:update"
  | "orders:delete"
  | "orders:cancel"
  | "payments:collect"
  | "tables:read"
  | "tables:manage"
  | "kitchen:manage"
  | "kitchen:read"
  | "expenses:read"
  | "expenses:create"
  | "expenses:manage"
  | "printers:read"
  | "printers:manage"
  | "users:manage"
  | "operations:read" | "operations:prepare" | "operations:serve";
export interface StaffRole { id: string; name: string; baseRole: Role; permissions: Permission[]; mobileMode: "waiter" | "operator" | "none"; builtin: boolean; active: boolean; }
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string; roleId?: string; roleName?: string; stations?: string[]; tables?: string[]; mobileMode?: "waiter" | "operator" | "none";
  role: Role;
  passwordMinimum?: 6 | 12;
  canDeleteOrders?: boolean;
  active: boolean;
  permissions: Permission[];
}
