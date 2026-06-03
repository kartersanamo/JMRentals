import { site } from "@/lib/site-config";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <section className="relative bg-navy pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${site.heroImage})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy/80" aria-hidden />
      <div className="relative z-10 section-padding !py-0 text-center max-w-4xl mx-auto">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl md:text-6xl text-cream text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-lg text-sand/90 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
