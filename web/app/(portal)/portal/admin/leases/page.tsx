import { ActionForm } from "@/components/portal/ActionForm";
import { AdminStripeChargeForm } from "@/components/portal/AdminStripeChargeForm";
import { ManualActionsPanel } from "@/components/portal/ManualActionsPanel";
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
import { ensureMonthlyRentCharges } from "@/lib/billing/rent-charges";
import { createLease, createPaymentRecord } from "@/lib/actions/portal";
import { db } from "@/lib/db";
import {
  stripeCheckoutSessionDashboardUrl,
  stripePaymentDashboardUrl,
  stripePaymentsListUrl,
} from "@/lib/payments/stripe-links";
import { syncStripePaymentStatus } from "@/lib/payments/stripe-sync";
import { isFeatureEnabled } from "@/lib/settings/store";
import { isStripeConfigured } from "@/lib/stripe";
import Link from "next/link";

export default async function AdminLeasesPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [onlineRentEnabled, stripeReady] = await Promise.all([
    isFeatureEnabled("onlineRentPayments"),
    Promise.resolve(isStripeConfigured()),
  ]);

  if (onlineRentEnabled) {
    await ensureMonthlyRentCharges(currentMonth);
  }
  if (stripeReady) {
    await syncStripePaymentStatus();
  }

  const [leases, residents, units, documents, payments] = await Promise.all([
    db.lease.findMany({
      include: {
        resident: { select: { firstName: true, lastName: true, email: true } },
        unit: true,
        leaseDocument: { select: { id: true, title: true, fileName: true } },
      },
      orderBy: { createdAt: "desc" },
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
      include: {
        resident: { select: { firstName: true, lastName: true } },
        lease: { select: { unit: { select: { name: true } } } },
      },
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
  ]);

  const residentOptions = residents
    .filter((resident) => resident.role === "RESIDENT")
    .map((resident) => ({
      id: resident.id,
      label: `${resident.firstName} ${resident.lastName}`,
    }));

  const pendingSignature = leases.filter((lease) => lease.status === "PENDING").length;
  const activeLeases = leases.filter((lease) => lease.status === "ACTIVE").length;
  const outstanding = payments.filter((payment) => !payment.paidAt);
  const outstandingTotal = outstanding.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return (
    <div>
      <PortalPageHeader
        title="Leases & Billing"
        subtitle="Leases and rent are tracked automatically. Use manual actions only when you need to override."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Active leases" value={activeLeases} />
        <SummaryCard label="Awaiting signature" value={pendingSignature} />
        <SummaryCard label="Outstanding charges" value={outstanding.length} />
        <SummaryCard
          label="Outstanding balance"
          value={`$${outstandingTotal.toLocaleString()}`}
        />
      </div>

      <PortalCard title="Leases" className="mb-8">
        {leases.length === 0 ? (
          <EmptyState message="No leases yet. Approving an application creates one automatically." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {leases.map((lease) => (
              <li key={lease.id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-navy">
                        {lease.resident.firstName} {lease.resident.lastName} — {lease.unit.name}
                      </p>
                      <StatusBadge status={lease.status} />
                    </div>
                    <p className="text-sm text-navy/60 mt-1">
                      {lease.resident.email} · Started {lease.startDate.toLocaleDateString()} · $
                      {Number(lease.monthlyRent).toLocaleString()}/mo
                    </p>
                    <p className="text-sm text-navy/60 mt-1">
                      Sent {lease.createdAt.toLocaleDateString()} ·{" "}
                      {lease.signedAt ? (
                        <span className="text-green-800">
                          Signed by {lease.signedByName} on{" "}
                          {lease.signedAt.toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-amber-800">Not signed yet</span>
                      )}
                    </p>
                  </div>
                  {lease.leaseDocument && (
                    <a
                      href={`/api/documents/${lease.leaseDocument.id}/download`}
                      className="text-sm text-gold hover:text-navy font-medium shrink-0"
                    >
                      Download {lease.leaseDocument.title}
                    </a>
                  )}
                </div>
                {!lease.leaseDocument && lease.status === "PENDING" && (
                  <p className="text-xs text-navy/50 mt-2">
                    No lease PDF attached yet. Upload one on{" "}
                    <Link href="/portal/admin/documents" className="text-gold hover:text-navy">
                      Documents
                    </Link>{" "}
                    and link it to this lease.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <PortalCard title="Rent & Payments" className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <p className="text-sm text-navy/60">
            {onlineRentEnabled
              ? `Monthly rent for ${currentMonth} is created automatically for active leases.`
              : "Online rent billing is disabled in System Control."}
            {stripeReady && " Stripe payment status syncs when you open this page."}
          </p>
          {stripeReady && (
            <a
              href={stripePaymentsListUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold hover:text-navy font-medium shrink-0"
            >
              Open Stripe Dashboard →
            </a>
          )}
        </div>

        {payments.length === 0 ? (
          <EmptyState message="No payment records yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy/50 border-b border-navy/10">
                  <th className="py-2 pr-4 font-medium">Resident</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium">Due</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Stripe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3 pr-4 text-navy">
                      {payment.resident.firstName} {payment.resident.lastName}
                      {payment.lease?.unit.name && (
                        <span className="block text-xs text-navy/50">
                          {payment.lease.unit.name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-navy">{payment.description}</td>
                    <td className="py-3 pr-4 text-navy/70">
                      {payment.dueDate.toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-navy font-medium">
                      ${Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      {payment.paidAt ? (
                        <span className="text-green-800">
                          Paid {payment.paidAt.toLocaleDateString()}
                        </span>
                      ) : payment.stripeCheckoutSessionId ? (
                        <span className="text-amber-800">Awaiting Stripe payment</span>
                      ) : (
                        <span className="text-navy/70">Unpaid</span>
                      )}
                    </td>
                    <td className="py-3">
                      {payment.stripePaymentId ? (
                        <a
                          href={stripePaymentDashboardUrl(payment.stripePaymentId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:text-navy"
                        >
                          View payment
                        </a>
                      ) : payment.stripeCheckoutSessionId ? (
                        <a
                          href={stripeCheckoutSessionDashboardUrl(
                            payment.stripeCheckoutSessionId
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:text-navy"
                        >
                          View checkout
                        </a>
                      ) : (
                        <span className="text-navy/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {outstanding.length > 0 && (
          <div className="mt-6 pt-6 border-t border-navy/10">
            <h3 className="text-sm font-medium text-navy mb-3">Quick actions on unpaid</h3>
            <ul className="divide-y divide-navy/10">
              {outstanding.slice(0, 10).map((payment) => (
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
                  <ActionForm action={markPaymentPaidManually} submitLabel="Mark paid (offline)" compact>
                    <input type="hidden" name="id" value={payment.id} />
                  </ActionForm>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PortalCard>

      {onlineRentEnabled && stripeReady && residentOptions.length > 0 && (
        <PortalCard title="Charge Resident (Stripe)" className="mb-8">
          <AdminStripeChargeForm residents={residentOptions} />
        </PortalCard>
      )}

      <ManualActionsPanel>
        <section>
          <h3 className="font-display text-lg text-navy mb-3">Create lease manually</h3>
          <ActionForm action={createLease} successMessage="Lease created." className="space-y-3">
            <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
              <option value="">Select resident / guest</option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.firstName} {resident.lastName} ({resident.role})
                </option>
              ))}
            </select>
            <select name="unitId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
              <option value="">Select unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
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
        </section>

        <section>
          <h3 className="font-display text-lg text-navy mb-3">Attach lease document</h3>
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
        </section>

        {onlineRentEnabled && (
          <section>
            <h3 className="font-display text-lg text-navy mb-3">Generate rent for a specific month</h3>
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
          </section>
        )}

        <section>
          <h3 className="font-display text-lg text-navy mb-3">Record offline payment</h3>
          <ActionForm
            action={createPaymentRecord}
            successMessage="Payment recorded."
            className="space-y-3"
          >
            <select name="residentId" required className="w-full border border-navy/20 px-4 py-3 bg-white">
              <option value="">Resident</option>
              {residentOptions.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.label}
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
            <input
              type="date"
              name="dueDate"
              required
              className="w-full border border-navy/20 px-4 py-3 bg-white"
            />
            <input
              type="date"
              name="paidAt"
              placeholder="Paid date (optional)"
              className="w-full border border-navy/20 px-4 py-3 bg-white"
            />
          </ActionForm>
        </section>
      </ManualActionsPanel>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-navy/10 p-4">
      <p className="text-xs uppercase tracking-wider text-navy/50">{label}</p>
      <p className="font-display text-2xl text-navy mt-1">{value}</p>
    </div>
  );
}
