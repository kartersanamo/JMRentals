import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/Button";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnitBrowseCard } from "@/components/units/UnitBrowseCard";
import { site } from "@/lib/site-config";
import { Bed, Calendar, Search } from "lucide-react";

export function BookingTeaser() {
  return (
    <section id="availability" className="section-padding bg-sand/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Find Your Home"
          title="Browse Availability"
          subtitle="We're building a seamless online booking experience. In the meantime, reach out to reserve your perfect apartment home."
        />

        <div className="max-w-3xl mx-auto mb-12 opacity-60 pointer-events-none select-none">
          <div className="grid sm:grid-cols-3 gap-4 p-6 bg-cream border border-navy/10">
            <div className="flex items-center gap-2 text-navy/50 text-sm">
              <Calendar size={18} aria-hidden />
              <span>Move-In Date</span>
            </div>
            <div className="flex items-center gap-2 text-navy/50 text-sm">
              <Bed size={18} aria-hidden />
              <span>Beds</span>
            </div>
            <div className="flex items-center gap-2 text-navy/50 text-sm">
              <Search size={18} aria-hidden />
              <span>Search</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {site.floorPlans.map((plan, i) => (
            <AnimateIn key={plan.name} delay={i * 0.1}>
              <UnitBrowseCard
                name={plan.name}
                beds={plan.beds}
                baths={plan.baths}
                description={plan.description}
                imageUrl={plan.imageUrl}
                overlay={
                  <div className="absolute inset-0 flex items-center justify-center bg-navy/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-cream text-sm uppercase tracking-widest font-medium">
                      Coming Soon
                    </span>
                  </div>
                }
              />
            </AnimateIn>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <ComingSoonBanner />
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/book" variant="secondary" size="lg">
            Learn About Online Booking
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
