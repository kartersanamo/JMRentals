import { ActionForm } from "@/components/portal/ActionForm";
import { EmploymentSummary } from "@/components/portal/EmploymentSummary";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { reviewApplication } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function StaffApplicationsPage() {
  const applications = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      guest: { select: { firstName: true, lastName: true, email: true } },
      desiredUnit: true,
    },
  });

  return (
    <div>
      <PortalPageHeader title="Applications" subtitle="Review and process rental applications." />
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
                  </div>
                  <StatusBadge status={app.status} />
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
                <ActionForm action={reviewApplication} successMessage="Application updated." className="space-y-2">
                  <input type="hidden" name="id" value={app.id} />
                  <select name="status" defaultValue={app.status} className="border border-navy/20 px-3 py-2 text-sm bg-white">
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="DENIED">Denied</option>
                  </select>
                  <textarea
                    name="reviewNotes"
                    rows={2}
                    defaultValue={app.reviewNotes ?? ""}
                    placeholder="Review notes (visible to guest)…"
                    className="w-full border border-navy/20 px-3 py-2 text-sm bg-white"
                  />
                </ActionForm>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
