/* ────────── imports ────────── */
import type { AuthUser, Permission } from "@/types/auth";
/* ────────── route visibility; the API independently enforces permissions ────────── */
export const routePermissions: Record<string, Permission> = {
  "/dashboard": "overview:read",
  "/orders": "orders:read",
  "/menu": "menu:read",
  "/inventory": "inventory:read",
  "/tables": "tables:read",
  "/kitchen": "kitchen:read",
  "/expenses": "expenses:read",
  "/printers": "printers:read",
  "/users": "users:manage",
};
export function canAccessPath(user: AuthUser, path: string) {
  const route = Object.keys(routePermissions).find(
    (base) => path === base || path.startsWith(base + "/")
  );
  return !route || user.permissions.includes(routePermissions[route]);
}
export function landingPath(user: AuthUser) {
  if (user.role === "kitchen") return "/kitchen";
  if (user.role === "waiter") return "/tables";
  return (
    Object.keys(routePermissions).find((path) =>
      user.permissions.includes(routePermissions[path])
    ) || "/profile"
  );
}
