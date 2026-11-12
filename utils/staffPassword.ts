/* ────────── employees use 6+ characters; Owner/Admin keep their existing minimum ────────── */
import type { StaffRole } from "@/types/auth";
export function staffPasswordMinimum(roleId: string, roles: StaffRole[]) {
  const role = roles.find(r => r.id === roleId);
  if (role && !role.builtin) return 6;
  return ["owner", "admin"].includes(roleId) ? 12 : 6;
}
