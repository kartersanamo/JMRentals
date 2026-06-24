import { ApplicationForm } from "@/components/portal/ApplicationForm";
import { EmptyState, PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/settings/store";
import Link from "next/link";

export default async function GuestApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit: unitId } = await searchParams;
  const enabled = await isFeatureEnabled("portalGuestApply");

  if (!enabled) {
    return (
      <div>
        <PortalPageHeader title="Rental Application" />
        <PortalCard>
          <p className="text-sm text-navy/70">
            Rental applications are currently disabled. Please contact the office directly.
          </p>
          <Link href="/portal/guest" className="inline-block mt-4 text-gold hover:text-navy text-sm">
            Back to dashboard
          </Link>
        </PortalCard>
      </div>
    );
  }

  const units = await db.unit.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { name: "asc" },
  });

  const unitOptions = units.map((u) => ({
    id: u.id,
    name: u.name,
    monthlyRent: Number(u.monthlyRent),
  }));

  return (
    <div>
      <PortalPageHeader
        title="Rental Application"
        subtitle="Tell us about your employment, income, and preferred move-in date."
      />
      <PortalCard>
        {unitOptions.length === 0 ? (
          <EmptyState message="No units are available to apply for right now. Browse units or contact the office." />
        ) : (
          <ApplicationForm units={unitOptions} defaultUnitId={unitId} />
        )}
      </PortalCard>
    </div>
  );
}
