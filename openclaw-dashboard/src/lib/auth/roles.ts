export const APP_ROLES = ["owner", "admin", "viewer"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function canManageOperations(role: AppRole | null | undefined) {
  return role === "owner" || role === "admin";
}
