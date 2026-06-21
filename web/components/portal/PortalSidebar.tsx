"use client";

import type { UserRole } from "@prisma/client";
import type { PortalNavIcon, PortalNavItem } from "@/lib/portal-nav";
import { site } from "@/lib/site-config";
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navIcons: Record<
  PortalNavIcon,
  React.ComponentType<{ className?: string }>
> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  shield: Shield,
  building: Building2,
  home: Home,
  clipboard: ClipboardList,
  wrench: Wrench,
  megaphone: Megaphone,
  scroll: ScrollText,
  settings: Settings,
  user: User,
  file: FileText,
  "credit-card": CreditCard,
  message: MessageSquare,
};

interface PortalSidebarProps {
  nav: PortalNavItem[];
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export function PortalSidebar({ nav, user }: PortalSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <>
      <div className="p-6 border-b border-cream/10">
        <Link href="/" className="font-display text-2xl text-cream hover:text-gold transition-colors">
          {site.name}
        </Link>
        <p className="mt-3 text-sm text-cream/70">{user.name}</p>
        <p className="text-xs text-gold uppercase tracking-wider mt-1">{user.role}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Portal navigation">
        {nav.map((item) => {
          const Icon = navIcons[item.icon];
          const active =
            pathname === item.href ||
            (item.href !== "/portal/admin" &&
              item.href !== "/portal/staff" &&
              item.href !== "/portal/resident" &&
              item.href !== "/portal/guest" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-gold text-navy font-medium"
                  : "text-cream/80 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 bg-navy text-cream p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-navy flex flex-col transform transition-transform md:transform-none ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {content}
      </aside>
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-navy/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
    </>
  );
}
