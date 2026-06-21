import { ApplicationForm } from "@/components/portal/ApplicationForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";

export default async function GuestApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit: unitId } = await searchParams;
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
        <ApplicationForm units={unitOptions} defaultUnitId={unitId} />
      </PortalCard>
    </div>
  );
}
