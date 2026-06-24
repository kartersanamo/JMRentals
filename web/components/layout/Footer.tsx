import { SiteLogo } from "@/components/brand/SiteLogo";
import {
  getDirectionsUrlFromContent,
  getFullAddressFromContent,
  getSiteContent,
} from "@/lib/settings/store";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const portalLinks = [
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
];

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

function formatOfficeHoursSummary(
  hours: Array<{ day: string; open?: string | null; close?: string | null; closed?: boolean }>
): string {
  const weekdays = hours.filter((entry) => !entry.closed);
  if (weekdays.length === 0) return "By appointment";

  const first = weekdays[0];
  const last = weekdays[weekdays.length - 1];
  if (first.open && first.close) {
    return `${first.day.slice(0, 3)}–${last.day.slice(0, 3)} ${first.open} – ${first.close}`;
  }
  return "See contact for hours";
}

export async function Footer({ showBooking = true }: { showBooking?: boolean }) {
  const site = await getSiteContent();
  const year = new Date().getFullYear();
  const directionsUrl = getDirectionsUrlFromContent(site);
  const exploreLinks = [
    { href: "/", label: "Home" },
    { href: "/amenities", label: "Amenities" },
    { href: "/gallery", label: "Gallery" },
    ...(showBooking ? [{ href: "/book", label: "Browse & Apply" }] : []),
    { href: "/#location", label: "Location" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <footer className="bg-navy text-cream shrink-0">
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
            <div className="mt-6 pt-6 border-t border-cream/10">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
                Portal
              </p>
              <ul className="space-y-2">
                {portalLinks.map((link) => (
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
                <span>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    {getFullAddressFromContent(site)}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="shrink-0 text-gold mt-0.5" aria-hidden />
                <a
                  href={`tel:${site.phone.replace(/\D/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="shrink-0 text-gold mt-0.5" aria-hidden />
                <a href={`mailto:${site.email}`} className="hover:text-gold transition-colors">
                  {site.email}
                </a>
              </li>
              <li className="pl-7 text-cream/60 text-xs">
                Office hours: {formatOfficeHoursSummary(site.hours)}
              </li>
              <li className="pl-7">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-gold hover:text-cream transition-colors"
                >
                  Get directions →
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
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms
            </Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <span>Larose, Louisiana · Bayou-side living</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
