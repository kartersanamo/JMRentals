import { PayRentButton } from "@/components/portal/PayRentButton";
import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import {
  getActiveLease,
  getAnnouncementsForResident,
  getResidentBalance,
  getResidentLease,
} from "@/lib/portal-queries";
import { isFeatureEnabled } from "@/lib/settings/store";
import { isStripeConfigured } from "@/lib/stripe";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ResidentDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESIDENT") redirect("/portal");

  const [
    lease,
    pendingLease,
    { balance, nextDue },
    announcements,
    openMaintenance,
    onlinePaymentsEnabled,
    stripeReady,
    leaseSigningEnabled,
  ] = await Promise.all([
    getActiveLease(session.user.id),
    getResidentLease(session.user.id),
    getResidentBalance(session.user.id),
    getAnnouncementsForResident(session.user.id),
    import("@/lib/db").then((m) =>
      m.db.maintenanceRequest.count({
        where: {
          residentId: session.user.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      })
    ),
    isFeatureEnabled("onlineRentPayments"),
    Promise.resolve(isStripeConfigured()),
    isFeatureEnabled("leaseSigning"),
  ]);

  const canPayOnline =
    onlinePaymentsEnabled && stripeReady && balance > 0;
  const needsSignature =
    leaseSigningEnabled && pendingLease?.status === "PENDING";

  return (
    <div>
      <PortalPageHeader
        title={`Welcome home, ${session.user.name?.split(" ")[0] ?? "Resident"}`}
        subtitle="Your lease, payments, and home resources in one place."
      />
      {needsSignature && (
        <div className="mb-6 bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-navy">
          Your lease is ready to sign.{" "}
          <Link href="/portal/resident/lease" className="text-gold hover:text-navy font-medium">
            Review and sign now →
          </Link>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PortalCard title="Your Unit">
          {lease || pendingLease ? (
            <>
              <p className="font-display text-xl text-navy">
                {(lease ?? pendingLease)!.unit.name}
              </p>
              <p className="text-sm text-navy/60 mt-1">
                ${Number((lease ?? pendingLease)!.monthlyRent).toLocaleString()}/mo
              </p>
              {pendingLease?.status === "PENDING" && (
                <p className="text-xs text-amber-800 mt-2">
                  <StatusBadge status="PENDING" />
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-navy/60">No lease on file.</p>
          )}
        </PortalCard>
        <PortalCard title="Balance Due">
          <p className="font-display text-2xl text-navy">${balance.toLocaleString()}</p>
          {nextDue && (
            <p className="text-xs text-navy/50 mt-1">
              Next due: {nextDue.dueDate.toLocaleDateString()}
            </p>
          )}
          {canPayOnline && (
            <div className="mt-3">
              <PayRentButton payAll label="Pay Rent" compact />
            </div>
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
            <Link href="/portal/resident/lease" className="text-gold hover:text-navy">
              My Lease
            </Link>
            <Link href="/portal/resident/documents" className="text-gold hover:text-navy">
              Documents
            </Link>
            <Link href="/portal/resident/payments" className="text-gold hover:text-navy">
              Payments
            </Link>
            <Link href="/portal/resident/messages" className="text-gold hover:text-navy">
              Message Staff
            </Link>
          </div>
        </PortalCard>
      </div>
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
