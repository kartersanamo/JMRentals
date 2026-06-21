import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [users, units, pendingApps, auditCount] = await Promise.all([
    db.user.count(),
    db.unit.count(),
    db.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    db.auditLog.count(),
  ]);

  return (
    <div>
      <PortalPageHeader title="Admin Dashboard" subtitle="Full system overview and governance." />
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <PortalCard title="Total Users"><p className="text-3xl font-display text-navy">{users}</p></PortalCard>
        <PortalCard title="Units"><p className="text-3xl font-display text-navy">{units}</p></PortalCard>
        <PortalCard title="Pending Apps"><p className="text-3xl font-display text-navy">{pendingApps}</p></PortalCard>
        <PortalCard title="Audit Events"><p className="text-3xl font-display text-navy">{auditCount}</p></PortalCard>
      </div>
      <PortalCard title="Quick Actions">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/portal/admin/admins" className="text-gold hover:text-navy">Manage Admins</Link>
          <Link href="/portal/admin/staff" className="text-gold hover:text-navy">Manage Staff</Link>
          <Link href="/portal/admin/units" className="text-gold hover:text-navy">Units</Link>
          <Link href="/portal/admin/leases" className="text-gold hover:text-navy">Leases</Link>
          <Link href="/portal/admin/audit" className="text-gold hover:text-navy">Audit Log</Link>
        </div>
      </PortalCard>
    </div>
  );
}
