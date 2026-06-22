import { SiteLogo } from "@/components/brand/SiteLogo";
import { site, getFullAddress } from "@/lib/site-config";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/amenities", label: "Amenities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/book", label: "Book Now" },
  { href: "/#contact", label: "Contact" },
];

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-cream">
      <div className="section-padding pb-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div>
            <SiteLogo size="xl" linked className="mb-4" />
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              {site.tagline}. Beautiful rental homes in Larose, Louisiana.
            </p>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cream/80 hover:text-gold transition-colors"
              aria-label="Visit J&M Rentals on Facebook"
            >
              <Facebook size={18} aria-hidden />
              Follow on Facebook
            </a>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/75 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/75 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-cream/75">
              <li className="flex gap-3">
                <MapPin size={16} className="shrink-0 text-gold mt-0.5" aria-hidden />
                <span>{getFullAddress()}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="shrink-0 text-gold mt-0.5" aria-hidden />
                <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="hover:text-gold transition-colors">
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="shrink-0 text-gold mt-0.5" aria-hidden />
                <a href={`mailto:${site.email}`} className="hover:text-gold transition-colors">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/50">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p>Larose, Louisiana · Bayou-side living</p>
        </div>
      </div>
    </footer>
  );
}
