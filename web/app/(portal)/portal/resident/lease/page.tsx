import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { getActiveLease } from "@/lib/portal-queries";
import { redirect } from "next/navigation";

export default async function ResidentLeasePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lease = await getActiveLease(session.user.id);

  return (
    <div>
      <PortalPageHeader title="My Lease" />
      <PortalCard>
        {!lease ? (
          <EmptyState message="No active lease found. Contact the office if this is incorrect." />
        ) : (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">Unit</dt>
              <dd className="text-navy font-medium mt-1">{lease.unit.name}</dd>
            </div>
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">Status</dt>
              <dd className="mt-1"><StatusBadge status={lease.status} /></dd>
            </div>
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">Start Date</dt>
              <dd className="text-navy mt-1">{lease.startDate.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">End Date</dt>
              <dd className="text-navy mt-1">
                {lease.endDate ? lease.endDate.toLocaleDateString() : "Month-to-month"}
              </dd>
            </div>
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">Monthly Rent</dt>
              <dd className="text-navy font-display text-xl mt-1">
                ${Number(lease.monthlyRent).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-navy/50 uppercase text-xs tracking-wider">Layout</dt>
              <dd className="text-navy mt-1">
                {lease.unit.beds} · {lease.unit.baths}
              </dd>
            </div>
            {lease.unit.address && (
              <div className="sm:col-span-2">
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Address</dt>
                <dd className="text-navy mt-1">{lease.unit.address}</dd>
              </div>
            )}
            {lease.houseRules && (
              <div className="sm:col-span-2">
                <dt className="text-navy/50 uppercase text-xs tracking-wider">House Rules</dt>
                <dd className="text-navy/80 mt-1 whitespace-pre-wrap">{lease.houseRules}</dd>
              </div>
            )}
          </dl>
        )}
      </PortalCard>
    </div>
  );
}
