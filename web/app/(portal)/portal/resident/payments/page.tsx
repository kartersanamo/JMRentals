import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { getResidentBalance } from "@/lib/portal-queries";
import { redirect } from "next/navigation";

export default async function ResidentPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { payments, balance } = await getResidentBalance(session.user.id);

  return (
    <div>
      <PortalPageHeader title="Payments" />
      <ComingSoonBanner
        title="Online Payments — Coming Soon"
        description="Stripe-powered rent payments will be available in a future update. For now, contact the office for payment options."
      />
      <PortalCard title="Account Balance" className="mt-8">
        <p className="font-display text-3xl text-navy">${balance.toLocaleString()}</p>
        <p className="text-sm text-navy/60 mt-1">Outstanding balance</p>
      </PortalCard>
      <PortalCard title="Payment History" className="mt-6">
        {payments.length === 0 ? (
          <EmptyState message="No payment records yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-navy/50 uppercase text-xs tracking-wider border-b border-navy/10">
                <th className="pb-2">Description</th>
                <th className="pb-2">Due</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-navy/5">
                  <td className="py-3 text-navy">{p.description}</td>
                  <td className="py-3 text-navy/70">{p.dueDate.toLocaleDateString()}</td>
                  <td className="py-3 text-navy">${Number(p.amount).toLocaleString()}</td>
                  <td className="py-3">
                    <StatusBadge status={p.paidAt ? "RESOLVED" : "OPEN"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PortalCard>
    </div>
  );
}
