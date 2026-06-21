import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site-config";
import { Calendar, CreditCard, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Online",
  description:
    "Online booking for J&M Rentals is coming soon. Contact us today to inquire about availability in Larose, LA.",
};

const features = [
  {
    icon: Calendar,
    title: "Real-Time Availability",
    description: "Browse open units and choose your ideal move-in date.",
  },
  {
    icon: Home,
    title: "Instant Applications",
    description: "Apply online and track your application status in one place.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Pay deposits and rent securely when booking goes live.",
  },
];

export default function BookPage() {
  return (
    <>
      <PageHero
        eyebrow="Online Booking"
        title="Coming Soon"
        subtitle="We're building a seamless way to browse availability, apply, and reserve your new home — all from this website."
      />
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-3xl text-center">
          <ComingSoonBanner
            title="Online Booking Launching Soon"
            description="Our reservation system is under development. In the meantime, please contact us directly — we'd love to help you find your perfect home."
          />

          <div className="grid sm:grid-cols-3 gap-8 mt-16 text-left">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  className="p-6 border border-navy/10 bg-sage-light/50"
                >
                  <Icon className="h-8 w-8 text-gold mb-4" aria-hidden />
                  <h3 className="font-display text-xl text-navy mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-navy/65 leading-relaxed">
                    {f.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/#contact" variant="primary" size="lg">
              Contact Us Today
            </ButtonLink>
            <ButtonLink href="/gallery" variant="outline" size="lg">
              View Gallery
            </ButtonLink>
          </div>

          <p className="mt-10 text-sm text-navy/50">
            Questions? Email{" "}
            <a href={`mailto:${site.email}`} className="text-gold hover:underline">
              {site.email}
            </a>{" "}
            or call{" "}
            <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="text-gold hover:underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
