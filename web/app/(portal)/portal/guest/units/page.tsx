import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function GuestUnitsPage() {
  const units = await db.unit.findMany({ orderBy: { monthlyRent: "asc" } });

  return (
    <div>
      <PortalPageHeader
        title="Browse Units"
        subtitle="Explore floor plans and availability at J&M Rentals."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <PortalCard key={unit.id} title={unit.name}>
            <p className="text-sm text-navy/60 mb-2">
              {unit.beds} · {unit.baths}
            </p>
            <p className="text-sm text-navy/80 mb-4">{unit.description}</p>
            <p className="font-display text-2xl text-navy mb-3">
              ${Number(unit.monthlyRent).toLocaleString()}
              <span className="text-sm font-body text-navy/50">/mo</span>
            </p>
            <StatusBadge status={unit.status} />
            {unit.status === "AVAILABLE" && (
              <Link
                href={`/portal/guest/apply?unit=${unit.id}`}
                className="block mt-4 text-center bg-navy text-cream py-2 text-sm uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
              >
                Apply for this unit
              </Link>
            )}
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
