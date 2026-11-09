/* ────────── match the API minimum for selected employee roles ────────── */
import type { StaffRole } from "@/types/auth";
export function staffPasswordMinimum(roleId: string, roles: StaffRole[]) {
  const role = roles.find(r => r.id === roleId);
  return role && !role.builtin ? (["waiter", "operator"].includes(role.mobileMode) ? 6 : 12) : ["waiter", "kitchen"].includes(roleId) ? 6 : 12;
}
