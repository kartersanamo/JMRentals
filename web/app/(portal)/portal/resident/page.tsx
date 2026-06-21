import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import {
  PortalCard,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import {
  getActiveLease,
  getAnnouncementsForResident,
  getResidentBalance,
} from "@/lib/portal-queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ResidentDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESIDENT") redirect("/portal");

  const [lease, { balance, nextDue }, announcements, openMaintenance] =
    await Promise.all([
      getActiveLease(session.user.id),
      getResidentBalance(session.user.id),
      getAnnouncementsForResident(session.user.id),
      import("@/lib/db").then((m) =>
        m.db.maintenanceRequest.count({
          where: { residentId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
        })
      ),
    ]);

  return (
    <div>
      <PortalPageHeader
        title={`Welcome home, ${session.user.name?.split(" ")[0] ?? "Resident"}`}
        subtitle="Your lease, payments, and home resources in one place."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PortalCard title="Your Unit">
          {lease ? (
            <>
              <p className="font-display text-xl text-navy">{lease.unit.name}</p>
              <p className="text-sm text-navy/60 mt-1">
                ${Number(lease.monthlyRent).toLocaleString()}/mo
              </p>
            </>
          ) : (
            <p className="text-sm text-navy/60">No active lease on file.</p>
          )}
        </PortalCard>
        <PortalCard title="Balance Due">
          <p className="font-display text-2xl text-navy">${balance.toLocaleString()}</p>
          {nextDue && (
            <p className="text-xs text-navy/50 mt-1">
              Next due: {nextDue.dueDate.toLocaleDateString()}
            </p>
          )}
        </PortalCard>
        <PortalCard title="Maintenance">
          <p className="font-display text-2xl text-navy">{openMaintenance}</p>
          <Link href="/portal/resident/maintenance" className="text-sm text-gold mt-1 inline-block">
            View requests →
          </Link>
        </PortalCard>
        <PortalCard title="Quick Links">
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/portal/resident/documents" className="text-gold hover:text-navy">Documents</Link>
            <Link href="/portal/resident/home-info" className="text-gold hover:text-navy">Home Info</Link>
            <Link href="/portal/resident/messages" className="text-gold hover:text-navy">Message Staff</Link>
          </div>
        </PortalCard>
      </div>
      <ComingSoonBanner
        title="Online rent payments coming soon"
        description="Pay rent securely online — launching in a future update."
      />
      {announcements.length > 0 && (
        <PortalCard title="Announcements" className="mt-8">
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="border-b border-navy/10 pb-3">
                <p className="font-medium text-navy">{a.title}</p>
                <p className="text-sm text-navy/70 mt-1">{a.body}</p>
              </li>
            ))}
          </ul>
        </PortalCard>
      )}
    </div>
  );
}
