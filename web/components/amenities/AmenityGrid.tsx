import { AnimateIn } from "@/components/ui/AnimateIn";
import type { Amenity } from "@/lib/site-config";

interface AmenityGridProps {
  amenities: Amenity[];
}

export function AmenityGrid({ amenities }: AmenityGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {amenities.map((amenity, i) => {
        const Icon = amenity.icon;
        return (
          <AnimateIn key={amenity.title} delay={(i % 6) * 0.05}>
            <article className="bg-cream p-8 h-full border border-navy/5 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group">
              <Icon
                className="h-9 w-9 text-gold mb-5 group-hover:scale-110 transition-transform"
                aria-hidden
              />
              <h3 className="font-display text-2xl text-navy mb-3">
                {amenity.title}
              </h3>
              <p className="text-navy/65 text-sm leading-relaxed">
                {amenity.description}
              </p>
            </article>
          </AnimateIn>
        );
      })}
    </div>
  );
}
