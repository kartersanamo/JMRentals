import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function GuestApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await db.application.findMany({
    where: { guestId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { desiredUnit: true },
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
                  <StatusBadge status={app.status} />
                </div>
                {app.moveInDate && (
                  <p className="text-sm text-navy/70">
                    Move-in: {app.moveInDate.toLocaleDateString()}
                  </p>
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
