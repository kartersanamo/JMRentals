import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site-config";

export function Welcome() {
  return (
    <section id="welcome" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Your New Home Awaits"
          title="Luxury Living Along the Bayou"
          subtitle={site.description}
        />
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimateIn>
            <p className="text-navy/80 text-lg leading-relaxed">
              At J&M Rentals, we believe your home should feel as beautiful as
              the Louisiana landscape that surrounds it. Our thoughtfully
              renovated properties combine modern comfort with the warmth and
              character of Larose — a community where bayou sunsets and neighborly
              charm are part of everyday life.
            </p>
            <p className="mt-6 text-navy/80 text-lg leading-relaxed">
              From updated interiors and reliable climate control to convenient
              access along Hwy 1, every detail is designed with you in mind.
              We can&apos;t wait to welcome you home.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <div className="relative aspect-[4/5] bg-sage-light overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${site.gallery[4]?.src ?? site.heroImage})`,
                }}
                role="img"
                aria-label="Interior of J&M Rentals property"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-navy/10" />
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
