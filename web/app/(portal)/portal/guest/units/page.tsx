import {
  EmptyState,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { UnitBrowseCard } from "@/components/units/UnitBrowseCard";
import { db } from "@/lib/db";

export default async function GuestUnitsPage() {
  const units = await db.unit.findMany({ orderBy: { monthlyRent: "asc" } });

  return (
    <div>
      <PortalPageHeader
        title="Browse Units"
        subtitle="Explore floor plans and availability at J&M Rentals."
      />
      {units.length === 0 ? (
        <EmptyState message="No units to display right now. Please check back later or contact the office." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <UnitBrowseCard
              key={unit.id}
              name={unit.name}
              beds={unit.beds}
              baths={unit.baths}
              description={unit.description}
              imageUrl={unit.imageUrl}
              monthlyRent={Number(unit.monthlyRent)}
              status={unit.status}
              actionHref={
                unit.status === "AVAILABLE"
                  ? `/portal/guest/apply?unit=${unit.id}`
                  : undefined
              }
              actionLabel={
                unit.status === "AVAILABLE" ? "Apply for this unit" : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
