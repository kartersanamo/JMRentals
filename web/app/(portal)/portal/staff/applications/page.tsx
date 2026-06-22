import { EmploymentSummary } from "@/components/portal/EmploymentSummary";
import { ApplicationReviewPanel } from "@/components/portal/ApplicationReviewPanel";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { formatRentTerm } from "@/lib/applications/effective";
import { db } from "@/lib/db";

export default async function StaffApplicationsPage() {
  const [applications, units] = await Promise.all([
    db.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guest: { select: { firstName: true, lastName: true, email: true } },
        desiredUnit: true,
        proposedUnit: true,
      },
    }),
    db.unit.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        monthlyRent: true,
        status: true,
      },
    }),
  ]);

  return (
    <div>
      <PortalPageHeader
        title="Applications"
        subtitle="Review applications, propose lease terms for guest confirmation, then approve to create a pending lease and email the guest to sign."
      />
      <PortalCard>
        {applications.length === 0 ? (
          <EmptyState message="No applications to review." />
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="border border-navy/10 p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-navy">
                      {app.guest.firstName} {app.guest.lastName}
                    </p>
                    <p className="text-sm text-navy/60">{app.guest.email}</p>
                    <p className="text-sm text-navy/70 mt-1">
                      Unit: {app.desiredUnit?.name ?? "No preference"}
                    </p>
                    {app.moveInDate && (
                      <p className="text-sm text-navy/70">
                        Move-in: {app.moveInDate.toLocaleDateString()} ·{" "}
                        {formatRentTerm(app.rentTerm)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.status} />
                    {app.proposalStatus && (
                      <StatusBadge status={app.proposalStatus} />
                    )}
                  </div>
                </div>
                <EmploymentSummary
                  employmentDetails={app.employmentDetails}
                  employmentInfo={app.employmentInfo}
                />
                {app.additionalNotes && (
                  <p className="text-sm text-navy/70 mb-3">
                    <span className="text-navy/50">Notes: </span>
                    {app.additionalNotes}
                  </p>
                )}
                <ApplicationReviewPanel
                  application={{
                    id: app.id,
                    status: app.status,
                    reviewNotes: app.reviewNotes,
                    moveInDate: app.moveInDate?.toISOString() ?? null,
                    rentTerm: app.rentTerm,
                    desiredUnitId: app.desiredUnitId,
                    proposedUnitId: app.proposedUnitId,
                    proposedMoveInDate:
                      app.proposedMoveInDate?.toISOString() ?? null,
                    proposedRentTerm: app.proposedRentTerm,
                    proposedMonthlyRent:
                      app.proposedMonthlyRent != null
                        ? Number(app.proposedMonthlyRent)
                        : null,
                    proposalStatus: app.proposalStatus,
                    proposalNotes: app.proposalNotes,
                    guestConfirmedAt:
                      app.guestConfirmedAt?.toISOString() ?? null,
                  }}
                  units={units.map((unit) => ({
                    ...unit,
                    monthlyRent: Number(unit.monthlyRent),
                  }))}
                />
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
