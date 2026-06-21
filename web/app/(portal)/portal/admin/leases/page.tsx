import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { createLease, createPaymentRecord } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function AdminLeasesPage() {
  const [leases, residents, units] = await Promise.all([
    db.lease.findMany({
      include: {
        resident: { select: { firstName: true, lastName: true, email: true } },
        unit: true,
      },
      orderBy: { startDate: "desc" },
    }),
    db.user.findMany({ where: { role: { in: ["GUEST", "RESIDENT"] } }, orderBy: { lastName: "asc" } }),
    db.unit.findMany({ where: { status: "AVAILABLE" } }),
  ]);

  return (
    <div>
      <PortalPageHeader title="Leases" />
      <PortalCard title="Create Lease" className="mb-8">
        <ActionForm action={createLease} successMessage="Lease created." className="space-y-3">
          <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select resident / guest</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.role})</option>
            ))}
          </select>
          <select name="unitId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input type="date" name="startDate" required className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <input type="number" name="monthlyRent" step="0.01" required placeholder="Monthly rent" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <textarea name="houseRules" rows={2} placeholder="House rules" className="w-full border border-navy/20 px-4 py-3 bg-white" />
        </ActionForm>
      </PortalCard>
      <PortalCard title="Record Payment" className="mb-8">
        <ActionForm action={createPaymentRecord} successMessage="Payment recorded." className="space-y-3">
          <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Resident</option>
            {residents.filter((r) => r.role === "RESIDENT").map((r) => (
              <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
            ))}
          </select>
          <input name="description" required placeholder="Description (e.g. March 2026 Rent)" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <input type="number" name="amount" step="0.01" required placeholder="Amount" className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <input type="date" name="dueDate" required className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <input type="date" name="paidAt" placeholder="Paid date (optional)" className="w-full border border-navy/20 px-4 py-3 bg-white" />
        </ActionForm>
      </PortalCard>
      <PortalCard title="All Leases">
        {leases.length === 0 ? (
          <EmptyState message="No leases yet." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {leases.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-navy">
                    {l.resident.firstName} {l.resident.lastName} — {l.unit.name}
                  </p>
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-sm text-navy/60">
                  {l.startDate.toLocaleDateString()} · ${Number(l.monthlyRent)}/mo
                </p>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
