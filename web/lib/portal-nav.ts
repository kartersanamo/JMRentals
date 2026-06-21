import type { UserRole } from "@prisma/client";
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
  Wrench,
  Megaphone,
  ScrollText,
} from "lucide-react";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getPortalNav(role: UserRole): PortalNavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { href: "/portal/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portal/admin/users", label: "All Users", icon: Users },
        { href: "/portal/admin/admins", label: "Admins", icon: Shield },
        { href: "/portal/admin/staff", label: "Staff", icon: Users },
        { href: "/portal/admin/units", label: "Units", icon: Building2 },
        { href: "/portal/admin/leases", label: "Leases", icon: Home },
        { href: "/portal/staff/guests", label: "Guests", icon: Users },
        { href: "/portal/staff/applications", label: "Applications", icon: ClipboardList },
        { href: "/portal/staff/residents", label: "Residents", icon: Home },
        { href: "/portal/staff/maintenance", label: "Maintenance", icon: Wrench },
        { href: "/portal/staff/announcements", label: "Announcements", icon: Megaphone },
        { href: "/portal/admin/audit", label: "Audit Log", icon: ScrollText },
        { href: "/portal/admin/settings", label: "Settings", icon: Settings },
        { href: "/portal/account", label: "My Account", icon: User },
      ];
    case "STAFF":
      return [
        { href: "/portal/staff", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portal/staff/guests", label: "Guests", icon: Users },
        { href: "/portal/staff/applications", label: "Applications", icon: ClipboardList },
        { href: "/portal/staff/residents", label: "Residents", icon: Home },
        { href: "/portal/staff/maintenance", label: "Maintenance", icon: Wrench },
        { href: "/portal/staff/announcements", label: "Announcements", icon: Megaphone },
        { href: "/portal/account", label: "My Account", icon: User },
      ];
    case "RESIDENT":
      return [
        { href: "/portal/resident", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portal/resident/lease", label: "My Lease", icon: Home },
        { href: "/portal/resident/documents", label: "Documents", icon: FileText },
        { href: "/portal/resident/maintenance", label: "Maintenance", icon: Wrench },
        { href: "/portal/resident/payments", label: "Payments", icon: CreditCard },
        { href: "/portal/resident/home-info", label: "Home Info", icon: Building2 },
        { href: "/portal/resident/checklist", label: "Move-In Checklist", icon: ClipboardList },
        { href: "/portal/resident/messages", label: "Messages", icon: MessageSquare },
        { href: "/portal/resident/community", label: "Community", icon: Megaphone },
        { href: "/portal/account", label: "My Profile", icon: User },
      ];
    case "GUEST":
      return [
        { href: "/portal/guest", label: "Dashboard", icon: LayoutDashboard },
        { href: "/portal/guest/units", label: "Browse Units", icon: Building2 },
        { href: "/portal/guest/apply", label: "Apply", icon: ClipboardList },
        { href: "/portal/guest/applications", label: "My Applications", icon: FileText },
        { href: "/portal/guest/messages", label: "Messages", icon: MessageSquare },
        { href: "/portal/account", label: "My Profile", icon: User },
      ];
    default:
      return [];
  }
}
