import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { updateMaintenance } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function StaffMaintenancePage() {
  const requests = await db.maintenanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      resident: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <div>
      <PortalPageHeader title="Maintenance" subtitle="Triage and resolve resident requests." />
      <PortalCard>
        {requests.length === 0 ? (
          <EmptyState message="No maintenance requests." />
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div key={req.id} className="border border-navy/10 p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <p className="font-medium text-navy">{req.title}</p>
                  <div className="flex gap-2">
                    <StatusBadge status={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>
                <p className="text-sm text-navy/60 mb-2">
                  {req.resident.firstName} {req.resident.lastName}
                </p>
                <p className="text-sm text-navy/80 whitespace-pre-wrap mb-3">{req.description}</p>
                <ActionForm action={updateMaintenance} successMessage="Request updated." className="space-y-2">
                  <input type="hidden" name="id" value={req.id} />
                  <select name="status" defaultValue={req.status} className="border border-navy/20 px-3 py-2 text-sm bg-white">
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <textarea
                    name="staffNotes"
                    rows={2}
                    defaultValue={req.staffNotes ?? ""}
                    placeholder="Staff notes…"
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
