import { ContactForm } from "@/components/contact/ContactForm";
import { HoursTable } from "@/components/contact/HoursTable";
import { MapSection } from "@/components/contact/MapSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site, getFullAddress } from "@/lib/site-config";
import { Mail, MapPin, Phone } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Feel Free to Contact Us"
          subtitle="Have questions about availability or our properties? We'd love to hear from you."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h3 className="font-display text-2xl text-navy mb-6">
              How Can We Help You?
            </h3>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div className="bg-sage-light p-8 border border-navy/5">
              <h3 className="font-display text-2xl text-navy mb-6">
                {site.name}
              </h3>
              <ul className="space-y-4 text-navy/80">
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <span>{getFullAddress()}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <a
                    href={`tel:${site.phone.replace(/\D/g, "")}`}
                    className="hover:text-gold transition-colors"
                  >
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="h-5 w-5 text-gold shrink-0" aria-hidden />
                  <a
                    href={`mailto:${site.email}`}
                    className="hover:text-gold transition-colors"
                  >
                    {site.email}
                  </a>
                </li>
              </ul>
              <div className="mt-8 pt-8 border-t border-navy/10">
                <HoursTable />
              </div>
            </div>
          </div>
        </div>

        <div id="location" className="mt-16">
          <h3 className="font-display text-3xl text-navy text-center mb-8">
            Find Us on the Map
          </h3>
          <div className="h-[400px] md:h-[480px] overflow-hidden border border-navy/10 shadow-lg">
            <MapSection />
          </div>
        </div>
      </div>
    </section>
  );
}
