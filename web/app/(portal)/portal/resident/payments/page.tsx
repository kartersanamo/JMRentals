import { PayRentButton } from "@/components/portal/PayRentButton";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { getResidentBalance } from "@/lib/portal-queries";
import { isFeatureEnabled } from "@/lib/settings/store";
import { isStripeConfigured } from "@/lib/stripe";
import { redirect } from "next/navigation";

export default async function ResidentPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [{ payments, balance }, onlinePaymentsEnabled, stripeReady, params] =
    await Promise.all([
      getResidentBalance(session.user.id),
      isFeatureEnabled("onlineRentPayments"),
      Promise.resolve(isStripeConfigured()),
      searchParams,
    ]);

  const unpaid = payments.filter((payment) => !payment.paidAt);
  const canPayOnline = onlinePaymentsEnabled && stripeReady && unpaid.length > 0;

  return (
    <div>
      <PortalPageHeader
        title="Payments"
        subtitle="View your balance and pay rent securely online."
      />
      {params.paid === "success" && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-900 px-4 py-3 text-sm">
          Payment submitted successfully. Your account will update shortly once Stripe confirms it.
        </div>
      )}
      {params.paid === "cancelled" && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
          Checkout was cancelled. You can try again whenever you are ready.
        </div>
      )}
      <PortalCard title="Account Balance" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl text-navy">${balance.toLocaleString()}</p>
            <p className="text-sm text-navy/60 mt-1">Outstanding balance</p>
          </div>
          {canPayOnline && (
            <PayRentButton payAll label={`Pay $${balance.toLocaleString()} Now`} />
          )}
        </div>
        {!stripeReady && onlinePaymentsEnabled && (
          <p className="text-sm text-amber-800 mt-4">
            Online payments are enabled but Stripe is not fully configured yet. Contact the office to pay.
          </p>
        )}
      </PortalCard>
      <PortalCard title="Payment History">
        {payments.length === 0 ? (
          <EmptyState message="No payment records yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy/50 uppercase text-xs tracking-wider border-b border-navy/10">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Due</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  {canPayOnline && <th className="pb-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-navy/5">
                    <td className="py-3 text-navy">{payment.description}</td>
                    <td className="py-3 text-navy/70">
                      {payment.dueDate.toLocaleDateString()}
                    </td>
                    <td className="py-3 text-navy">
                      ${Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={payment.paidAt ? "RESOLVED" : "OPEN"} />
                      {payment.paidAt && (
                        <span className="block text-xs text-navy/50 mt-1">
                          Paid {payment.paidAt.toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    {canPayOnline && (
                      <td className="py-3">
                        {!payment.paidAt && (
                          <PayRentButton
                            paymentId={payment.id}
                            label="Pay"
                            compact
                          />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
