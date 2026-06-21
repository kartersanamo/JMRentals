import type { UserRole } from "@prisma/client";

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/portal/admin",
  STAFF: "/portal/staff",
  RESIDENT: "/portal/resident",
  GUEST: "/portal/guest",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  STAFF: 3,
  RESIDENT: 2,
  GUEST: 1,
};

export function getRoleHome(role: UserRole): string {
  return ROLE_HOME[role];
}

export function canAccessRolePath(
  userRole: UserRole,
  path: string
): boolean {
  if (userRole === "ADMIN") return true;
  if (path.startsWith("/portal/admin")) return false;
  if (path.startsWith("/portal/staff")) {
    return userRole === "STAFF";
  }
  if (path.startsWith("/portal/resident")) {
    return userRole === "RESIDENT";
  }
  if (path.startsWith("/portal/guest")) {
    return userRole === "GUEST";
  }
  if (
    path.startsWith("/portal/notifications") ||
    path.startsWith("/portal/account")
  ) {
    return true;
  }
  return true;
}

export function hasRole(
  userRole: UserRole,
  allowed: UserRole | UserRole[]
): boolean {
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.includes(userRole);
}

export function canManageStaff(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageGuests(role: UserRole): boolean {
  return role === "ADMIN" || role === "STAFF";
}
