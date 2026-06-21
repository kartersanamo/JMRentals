import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { updateGuestNotes, updateUserStatus } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function StaffGuestsPage() {
  const guests = await db.user.findMany({
    where: { role: "GUEST" },
    orderBy: { createdAt: "desc" },
    include: {
      applications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <PortalPageHeader title="Guests" subtitle="Manage prospective resident accounts." />
      <PortalCard>
        {guests.length === 0 ? (
          <EmptyState message="No guest accounts yet." />
        ) : (
          <div className="space-y-6">
            {guests.map((guest) => (
              <div key={guest.id} className="border border-navy/10 p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-navy">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <p className="text-sm text-navy/60">{guest.email}</p>
                    {guest.phone && (
                      <p className="text-sm text-navy/60">{guest.phone}</p>
                    )}
                  </div>
                  <StatusBadge status={guest.status} />
                </div>
                {guest.applications[0] && (
                  <p className="text-xs text-navy/50 mb-3">
                    Latest app: <StatusBadge status={guest.applications[0].status} />
                  </p>
                )}
                <ActionForm action={updateGuestNotes} successMessage="Notes saved." className="space-y-2 mb-3">
                  <input type="hidden" name="id" value={guest.id} />
                  <textarea
                    name="guestNotes"
                    rows={2}
                    defaultValue={guest.guestNotes ?? ""}
                    placeholder="Internal notes…"
                    className="w-full border border-navy/20 px-3 py-2 text-sm bg-white"
                  />
                </ActionForm>
                <div className="flex gap-2">
                  {guest.status === "ACTIVE" ? (
                    <ActionForm action={updateUserStatus} successMessage="Guest disabled." className="inline">
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="status" value="DISABLED" />
                    </ActionForm>
                  ) : (
                    <ActionForm action={updateUserStatus} successMessage="Guest enabled." className="inline">
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                    </ActionForm>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}
