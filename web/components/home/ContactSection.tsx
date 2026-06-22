import { ContactForm } from "@/components/contact/ContactForm";
import { HoursTable } from "@/components/contact/HoursTable";
import { MapSection } from "@/components/contact/MapSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteContent } from "@/lib/settings/types";
import {
  getDirectionsUrlFromContent,
  getFullAddressFromContent,
} from "@/lib/settings/store";
import { Mail, MapPin, Phone } from "lucide-react";

export function ContactSection({
  content,
  showForm = true,
  showMap = true,
}: {
  content: SiteContent;
  showForm?: boolean;
  showMap?: boolean;
}) {
  const address = getFullAddressFromContent(content);
  const directionsUrl = getDirectionsUrlFromContent(content);

  return (
    <section id="contact" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Feel Free to Contact Us"
          subtitle={
            showForm
              ? "Have questions about availability or our properties? Send us a message or reach out by phone or email."
              : "Have questions? Reach out by phone or email — we would love to hear from you."
          }
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h3 className="font-display text-2xl text-navy mb-6">
              How Can We Help You?
            </h3>
            {showForm ? (
              <ContactForm />
            ) : (
              <p className="text-sm text-navy/60 bg-sage-light/50 border border-navy/10 p-4">
                The online contact form is temporarily unavailable. Please call{" "}
                <a href={`tel:${content.phone.replace(/\D/g, "")}`} className="text-gold">
                  {content.phone}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${content.email}`} className="text-gold">
                  {content.email}
                </a>
                .
              </p>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-sage-light p-8 border border-navy/5">
              <h3 className="font-display text-2xl text-navy mb-6">{content.name}</h3>
              <ul className="space-y-4 text-navy/80">
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <span>{address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <a
                    href={`tel:${content.phone.replace(/\D/g, "")}`}
                    className="hover:text-gold transition-colors"
                  >
                    {content.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <a
                    href={`mailto:${content.email}`}
                    className="hover:text-gold transition-colors"
                  >
                    {content.email}
                  </a>
                </li>
              </ul>
              <div className="mt-8 pt-8 border-t border-navy/10">
                <HoursTable hours={content.hours} />
              </div>
            </div>
          </div>
        </div>

        {showMap && (
          <div id="location" className="mt-16">
            <h3 className="font-display text-3xl text-navy text-center mb-8">
              Find Us on the Map
            </h3>
            <div className="h-[400px] md:h-[480px] overflow-hidden border border-navy/10 shadow-lg">
              <MapSection directionsUrl={directionsUrl} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
