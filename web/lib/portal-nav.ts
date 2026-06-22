import type { UserRole } from "@prisma/client";

export type PortalNavIcon =
  | "layout-dashboard"
  | "users"
  | "shield"
  | "building"
  | "home"
  | "clipboard"
  | "wrench"
  | "megaphone"
  | "scroll"
  | "settings"
  | "user"
  | "file"
  | "credit-card"
  | "message"
  | "bell";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: PortalNavIcon;
}

export function getPortalNav(role: UserRole): PortalNavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { href: "/portal/admin", label: "Dashboard", icon: "layout-dashboard" },
        { href: "/portal/admin/users", label: "All Users", icon: "users" },
        { href: "/portal/admin/admins", label: "Admins", icon: "shield" },
        { href: "/portal/admin/staff", label: "Staff", icon: "users" },
        { href: "/portal/admin/units", label: "Units", icon: "building" },
        { href: "/portal/admin/leases", label: "Leases", icon: "home" },
        { href: "/portal/staff/guests", label: "Guests", icon: "users" },
        { href: "/portal/staff/applications", label: "Applications", icon: "clipboard" },
        { href: "/portal/staff/residents", label: "Residents", icon: "home" },
        { href: "/portal/staff/maintenance", label: "Maintenance", icon: "wrench" },
        { href: "/portal/staff/announcements", label: "Announcements", icon: "megaphone" },
        { href: "/portal/admin/audit", label: "Audit Log", icon: "scroll" },
        { href: "/portal/admin/settings", label: "System Control", icon: "settings" },
        { href: "/portal/notifications", label: "Notifications", icon: "bell" },
        { href: "/portal/account", label: "My Account", icon: "user" },
      ];
    case "STAFF":
      return [
        { href: "/portal/staff", label: "Dashboard", icon: "layout-dashboard" },
        { href: "/portal/staff/guests", label: "Guests", icon: "users" },
        { href: "/portal/staff/applications", label: "Applications", icon: "clipboard" },
        { href: "/portal/staff/residents", label: "Residents", icon: "home" },
        { href: "/portal/staff/maintenance", label: "Maintenance", icon: "wrench" },
        { href: "/portal/staff/announcements", label: "Announcements", icon: "megaphone" },
        { href: "/portal/notifications", label: "Notifications", icon: "bell" },
        { href: "/portal/account", label: "My Account", icon: "user" },
      ];
    case "RESIDENT":
      return [
        { href: "/portal/resident", label: "Dashboard", icon: "layout-dashboard" },
        { href: "/portal/resident/lease", label: "My Lease", icon: "home" },
        { href: "/portal/resident/documents", label: "Documents", icon: "file" },
        { href: "/portal/resident/maintenance", label: "Maintenance", icon: "wrench" },
        { href: "/portal/resident/payments", label: "Payments", icon: "credit-card" },
        { href: "/portal/resident/home-info", label: "Home Info", icon: "building" },
        { href: "/portal/resident/checklist", label: "Move-In Checklist", icon: "clipboard" },
        { href: "/portal/resident/messages", label: "Messages", icon: "message" },
        { href: "/portal/resident/community", label: "Community", icon: "megaphone" },
        { href: "/portal/notifications", label: "Notifications", icon: "bell" },
        { href: "/portal/account", label: "My Profile", icon: "user" },
      ];
    case "GUEST":
      return [
        { href: "/portal/guest", label: "Dashboard", icon: "layout-dashboard" },
        { href: "/portal/guest/units", label: "Browse Units", icon: "building" },
        { href: "/portal/guest/apply", label: "Apply", icon: "clipboard" },
        { href: "/portal/guest/applications", label: "My Applications", icon: "file" },
        { href: "/portal/guest/messages", label: "Messages", icon: "message" },
        { href: "/portal/notifications", label: "Notifications", icon: "bell" },
        { href: "/portal/account", label: "My Profile", icon: "user" },
      ];
    default:
      return [];
  }
}
