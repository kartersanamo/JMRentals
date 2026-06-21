import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { createLease } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function StaffResidentsPage() {
  const [residents, units, approvedGuests] = await Promise.all([
    db.user.findMany({
      where: { role: "RESIDENT" },
      include: {
        leases: {
          where: { status: "ACTIVE" },
          include: { unit: true },
        },
      },
      orderBy: { lastName: "asc" },
    }),
    db.unit.findMany({ where: { status: "AVAILABLE" } }),
    db.user.findMany({
      where: {
        role: "GUEST",
        applications: { some: { status: "APPROVED" } },
      },
      include: { applications: { where: { status: "APPROVED" }, take: 1 } },
    }),
  ]);

  return (
    <div>
      <PortalPageHeader title="Residents" subtitle="Active residents and lease assignments." />
      <PortalCard title="Active Residents" className="mb-8">
        {residents.length === 0 ? (
          <EmptyState message="No residents yet. Assign a lease to promote an approved guest." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {residents.map((r) => (
              <li key={r.id} className="py-3">
                <p className="font-medium text-navy">
                  {r.firstName} {r.lastName} — {r.email}
                </p>
                {r.leases[0] && (
                  <p className="text-sm text-navy/70">
                    {r.leases[0].unit.name} · ${Number(r.leases[0].monthlyRent)}/mo · since{" "}
                    {r.leases[0].startDate.toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
      {approvedGuests.length > 0 && (
        <PortalCard title="Assign Lease (Approved Guests)">
          {approvedGuests.map((guest) => (
            <div key={guest.id} className="border border-navy/10 p-4 mb-4">
              <p className="font-medium text-navy mb-3">
                {guest.firstName} {guest.lastName} ({guest.email})
              </p>
              <ActionForm action={createLease} successMessage="Lease created. Guest promoted to resident." className="space-y-2">
                <input type="hidden" name="residentId" value={guest.id} />
                <select name="unitId" required className="w-full border border-navy/20 px-3 py-2 bg-white">
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — ${Number(u.monthlyRent)}/mo
                    </option>
                  ))}
                </select>
                <input type="date" name="startDate" required className="w-full border border-navy/20 px-3 py-2 bg-white" />
                <input
                  type="number"
                  name="monthlyRent"
                  step="0.01"
                  placeholder="Monthly rent"
                  required
                  className="w-full border border-navy/20 px-3 py-2 bg-white"
                />
                <textarea name="houseRules" rows={2} placeholder="House rules (optional)" className="w-full border border-navy/20 px-3 py-2 bg-white" />
              </ActionForm>
            </div>
          ))}
        </PortalCard>
      )}
    </div>
  );
}
