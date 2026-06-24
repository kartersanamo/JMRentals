import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnitBrowseCard } from "@/components/units/UnitBrowseCard";
import type { SiteFloorPlan } from "@/lib/settings/types";
import { site } from "@/lib/site-config";

export function BookingTeaser({
  floorPlans = site.floorPlans,
  showBooking = true,
}: {
  floorPlans?: SiteFloorPlan[];
  showBooking?: boolean;
}) {
  if (!showBooking) return null;

  return (
    <section id="availability" className="section-padding bg-sand/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Find Your Home"
          title="Browse Availability"
          subtitle="Browse floor plans, compare options, and apply online through your guest portal."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {floorPlans.map((plan, i) => (
            <AnimateIn key={plan.name} delay={i * 0.1}>
              <UnitBrowseCard
                name={plan.name}
                beds={plan.beds}
                baths={plan.baths}
                description={plan.description}
                imageUrl={plan.imageUrl}
                actionHref="/book"
                actionLabel="Browse & Apply"
              />
            </AnimateIn>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/book" variant="secondary" size="lg">
            Browse & Apply
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
