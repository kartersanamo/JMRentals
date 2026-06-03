import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site-config";
import { Check } from "lucide-react";

export function Neighborhood() {
  return (
    <section className="section-padding bg-navy text-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Neighborhood"
          title="Convenient Bayou Living"
          subtitle="Larose offers the perfect blend of small-town charm and everyday convenience. When you choose J&M Rentals, you're steps from everything that makes Louisiana living special."
          light
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {site.neighborhood.map((item, i) => (
            <AnimateIn key={item} delay={i * 0.04}>
              <div className="flex items-start gap-3 p-4 border border-cream/10 hover:border-gold/40 transition-colors">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" aria-hidden />
                <span className="text-cream/90 text-sm leading-relaxed">{item}</span>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
