export const ADMIN_ROLES = ["SUPER_ADMIN", "PROJECT_DIRECTOR", "PROJECT_MANAGER", "DOCUMENT_CONTROLLER"];

export function isAdminRole(role?: string | null) {
  return !!role && ADMIN_ROLES.includes(role);
}
