import { ActionForm } from "@/components/portal/ActionForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import {
  attachLeaseDocument,
  generateMonthlyRent,
  markPaymentPaidManually,
} from "@/lib/actions/billing";
import { createLease, createPaymentRecord } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function AdminLeasesPage() {
  const [leases, residents, units, documents, payments] = await Promise.all([
    db.lease.findMany({
      include: {
        resident: { select: { firstName: true, lastName: true, email: true } },
        unit: true,
        leaseDocument: { select: { id: true, title: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    db.user.findMany({
      where: { role: { in: ["GUEST", "RESIDENT"] } },
      orderBy: { lastName: "asc" },
    }),
    db.unit.findMany({ where: { status: "AVAILABLE" } }),
    db.document.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, category: true },
    }),
    db.paymentRecord.findMany({
      where: { paidAt: null },
      include: {
        resident: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div>
      <PortalPageHeader
        title="Leases & Billing"
        subtitle="Create leases, attach lease documents, generate rent charges, and record payments."
      />
      <PortalCard title="Create Lease" className="mb-8">
        <ActionForm action={createLease} successMessage="Lease created." className="space-y-3">
          <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select resident / guest</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.firstName} {r.lastName} ({r.role})
              </option>
            ))}
          </select>
          <select name="unitId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="startDate"
            required
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
          <input
            type="number"
            name="monthlyRent"
            step="0.01"
            required
            placeholder="Monthly rent"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
          <textarea
            name="houseRules"
            rows={2}
            placeholder="House rules"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
        </ActionForm>
        <p className="text-sm text-navy/60 mt-3">
          New leases start as pending until the resident signs in the portal.
        </p>
      </PortalCard>

      <PortalCard title="Generate Monthly Rent" className="mb-8">
        <ActionForm
          action={generateMonthlyRent}
          successMessage="Rent charges generated."
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-navy/50 mb-1">
              Billing month
            </label>
            <input
              type="month"
              name="billingMonth"
              defaultValue={currentMonth}
              required
              className="border border-navy/20 px-4 py-3 bg-white"
            />
          </div>
        </ActionForm>
        <p className="text-sm text-navy/60 mt-3">
          Creates one unpaid rent charge per active lease for the selected month.
        </p>
      </PortalCard>

      <PortalCard title="Attach Lease Document" className="mb-8">
        <ActionForm
          action={attachLeaseDocument}
          successMessage="Lease document attached."
          className="space-y-3"
        >
          <select name="leaseId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select lease</option>
            {leases.map((lease) => (
              <option key={lease.id} value={lease.id}>
                {lease.resident.firstName} {lease.resident.lastName} — {lease.unit.name}
              </option>
            ))}
          </select>
          <select name="documentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Select uploaded document</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.category})
              </option>
            ))}
          </select>
        </ActionForm>
        <p className="text-sm text-navy/60 mt-3">
          Upload lease PDFs first on the Documents page, then attach them here.
        </p>
      </PortalCard>

      <PortalCard title="Record Payment" className="mb-8">
        <ActionForm action={createPaymentRecord} successMessage="Payment recorded." className="space-y-3">
          <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
            <option value="">Resident</option>
            {residents.filter((r) => r.role === "RESIDENT").map((r) => (
              <option key={r.id} value={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))}
          </select>
          <input
            name="description"
            required
            placeholder="Description (e.g. March 2026 Rent)"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
          <input
            type="number"
            name="amount"
            step="0.01"
            required
            placeholder="Amount"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
          <input type="date" name="dueDate" required className="w-full border border-navy/20 px-4 py-3 bg-white" />
          <input
            type="date"
            name="paidAt"
            placeholder="Paid date (optional)"
            className="w-full border border-navy/20 px-4 py-3 bg-white"
          />
        </ActionForm>
      </PortalCard>

      {payments.length > 0 && (
        <PortalCard title="Outstanding Payments" className="mb-8">
          <ul className="divide-y divide-navy/10">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-navy">{payment.description}</p>
                  <p className="text-sm text-navy/60">
                    {payment.resident.firstName} {payment.resident.lastName} · Due{" "}
                    {payment.dueDate.toLocaleDateString()} · $
                    {Number(payment.amount).toLocaleString()}
                  </p>
                </div>
                <ActionForm action={markPaymentPaidManually} submitLabel="Mark Paid" compact>
                  <input type="hidden" name="id" value={payment.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        </PortalCard>
      )}

      <PortalCard title="All Leases">
        {leases.length === 0 ? (
          <EmptyState message="No leases yet." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {leases.map((lease) => (
              <li key={lease.id} className="py-4">
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-navy">
                    {lease.resident.firstName} {lease.resident.lastName} — {lease.unit.name}
                  </p>
                  <StatusBadge status={lease.status} />
                </div>
                <p className="text-sm text-navy/60 mt-1">
                  {lease.startDate.toLocaleDateString()} · ${Number(lease.monthlyRent)}/mo
                </p>
                {lease.leaseDocument && (
                  <p className="text-sm text-navy/60 mt-1">
                    Lease document: {lease.leaseDocument.title}
                  </p>
                )}
                {lease.signedAt && (
                  <p className="text-sm text-green-800 mt-1">
                    Signed by {lease.signedByName} on {lease.signedAt.toLocaleDateString()}
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
