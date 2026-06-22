import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { formatRentTerm } from "@/lib/applications/effective";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GuestApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await db.application.findMany({
    where: { guestId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { desiredUnit: true, proposedUnit: true },
  });

  return (
    <div>
      <PortalPageHeader title="My Applications" />
      <PortalCard>
        {applications.length === 0 ? (
          <EmptyState message="You haven't submitted any applications yet." />
        ) : (
          <ul className="space-y-6">
            {applications.map((app) => (
              <li key={app.id} className="border border-navy/10 p-4">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="font-medium text-navy">
                      {app.desiredUnit?.name ?? "General application"}
                    </p>
                    <p className="text-xs text-navy/50">
                      Submitted {app.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.status} />
                    {app.proposalStatus && (
                      <StatusBadge status={app.proposalStatus} />
                    )}
                  </div>
                </div>
                {app.moveInDate && (
                  <p className="text-sm text-navy/70">
                    Move-in: {app.moveInDate.toLocaleDateString()} ·{" "}
                    {formatRentTerm(app.rentTerm)}
                  </p>
                )}
                {app.proposalStatus === "PENDING" && app.proposedUnit && (
                  <div className="mt-3 text-sm bg-gold/10 border border-gold/30 p-3">
                    <p className="font-medium text-navy">
                      Action needed: confirm proposed lease terms
                    </p>
                    <p className="text-navy/70 mt-1">
                      {app.proposedUnit.name} ·{" "}
                      {app.proposedMoveInDate?.toLocaleDateString()} · $
                      {app.proposedMonthlyRent != null
                        ? Number(app.proposedMonthlyRent).toLocaleString()
                        : "—"}
                    </p>
                    {app.proposalToken && (
                      <Link
                        href={`/portal/guest/applications/confirm?token=${encodeURIComponent(app.proposalToken)}`}
                        className="inline-block mt-2 text-gold hover:text-navy font-medium"
                      >
                        Review and confirm
                      </Link>
                    )}
                  </div>
                )}
                {app.reviewNotes && (
                  <p className="text-sm text-navy/80 mt-2 bg-sage-light p-3">
                    Staff note: {app.reviewNotes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
