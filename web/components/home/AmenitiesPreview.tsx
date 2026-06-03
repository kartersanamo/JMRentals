import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site-config";

export function AmenitiesPreview() {
  const preview = site.amenities.slice(0, 6);

  return (
    <section id="amenities" className="section-padding bg-sage-light">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Amenities"
          title="A Premier Living Experience"
          subtitle="Meticulously maintained homes with modern finishes and the comforts that make everyday life effortless."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {preview.map((amenity, i) => {
            const Icon = amenity.icon;
            return (
              <AnimateIn key={amenity.title} delay={i * 0.06}>
                <article className="bg-cream p-8 h-full border border-navy/5 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group">
                  <Icon
                    className="h-8 w-8 text-gold mb-5 group-hover:scale-110 transition-transform"
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
        <div className="mt-14 text-center">
          <ButtonLink href="/amenities" variant="outline" size="lg">
            View All Amenities
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
