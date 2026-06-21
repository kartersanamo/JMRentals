import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { submitMaintenance } from "@/lib/actions/portal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ResidentMaintenancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requests = await db.maintenanceRequest.findMany({
    where: { residentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PortalPageHeader title="Maintenance" subtitle="Submit and track repair requests." />
      <PortalCard title="New Request" className="mb-8">
        <ActionForm action={submitMaintenance} successMessage="Request submitted." className="space-y-3">
          <input name="title" required placeholder="Brief title" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <select name="priority" defaultValue="MEDIUM" className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <textarea name="description" rows={4} required placeholder="Describe the issue…" className="w-full border border-navy/20 px-4 py-3 bg-white resize-y" />
        </ActionForm>
      </PortalCard>
      <PortalCard title="Your Requests">
        {requests.length === 0 ? (
          <EmptyState message="No maintenance requests yet." />
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req.id} className="border border-navy/10 p-4">
                <div className="flex justify-between gap-2 mb-2">
                  <p className="font-medium text-navy">{req.title}</p>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-navy/80">{req.description}</p>
                {req.staffNotes && (
                  <p className="text-sm text-navy/70 mt-2 bg-sage-light p-2">
                    Staff: {req.staffNotes}
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
