import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function StaffDashboardPage() {
  const [pendingApps, openMaintenance, recentGuests] = await Promise.all([
    db.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    db.maintenanceRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.user.count({ where: { role: "GUEST", createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
  ]);

  return (
    <div>
      <PortalPageHeader
        title="Staff Dashboard"
        subtitle="Manage guests, applications, and resident support."
      />
      <div className="grid md:grid-cols-3 gap-6">
        <PortalCard title="Pending Applications">
          <p className="text-3xl font-display text-navy">{pendingApps}</p>
          <Link href="/portal/staff/applications" className="text-sm text-gold mt-2 inline-block">
            Review →
          </Link>
        </PortalCard>
        <PortalCard title="Open Maintenance">
          <p className="text-3xl font-display text-navy">{openMaintenance}</p>
          <Link href="/portal/staff/maintenance" className="text-sm text-gold mt-2 inline-block">
            Triage →
          </Link>
        </PortalCard>
        <PortalCard title="New Guests (7 days)">
          <p className="text-3xl font-display text-navy">{recentGuests}</p>
          <Link href="/portal/staff/guests" className="text-sm text-gold mt-2 inline-block">
            View guests →
          </Link>
        </PortalCard>
      </div>
    </div>
  );
}
