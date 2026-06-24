import { site } from "@/lib/site-config";
import { DEFAULT_GALLERY_CATEGORIES } from "@/lib/gallery-categories";
import type { SiteContent, SystemConfig } from "./types";

export const SYSTEM_CONFIG_KEY = "system_config";
export const SITE_CONTENT_KEY = "site_content";

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  features: {
    contactForm: true,
    guestRegistration: true,
    publicGallery: true,
    publicAmenitiesPage: true,
    onlineBookingPage: true,
    portalGuestApply: true,
    portalMessages: true,
    emailNotifications: true,
    maintenanceRequests: true,
    guestEmailVerification: true,
    onlineRentPayments: true,
    leaseSigning: true,
    documentManagement: true,
  },
  marketing: {
    showHero: true,
    showWelcome: true,
    showAmenitiesPreview: true,
    showGalleryPreview: true,
    showNeighborhood: true,
    showBookingTeaser: true,
    showContactSection: true,
    showMapOnContact: true,
  },
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  name: site.name,
  legalName: site.legalName,
  tagline: site.tagline,
  description: site.description,
  phone: site.phone,
  email: site.email,
  termsLastUpdated: site.termsLastUpdated,
  privacyLastUpdated: site.privacyLastUpdated,
  heroImage: site.heroImage,
  address: { ...site.address },
  coordinates: { ...site.coordinates },
  social: { ...site.social },
  hours: site.hours.map((row) => ({ ...row })),
  neighborhood: [...site.neighborhood],
  galleryCategories: DEFAULT_GALLERY_CATEGORIES.map((item) => ({ ...item })),
  gallery: site.gallery.map((image) => ({ ...image })),
  floorPlans: site.floorPlans.map((plan) => ({ ...plan })),
};

export const FEATURE_DEFINITIONS: Array<{
  key: keyof SystemConfig["features"];
  label: string;
  description: string;
  group: "website" | "portal" | "system";
}> = [
  {
    key: "contactForm",
    label: "Contact form",
    description: "Public website contact form on the homepage",
    group: "website",
  },
  {
    key: "publicGallery",
    label: "Gallery page",
    description: "Public /gallery page and gallery previews",
    group: "website",
  },
  {
    key: "publicAmenitiesPage",
    label: "Amenities page",
    description: "Public /amenities page and amenities previews",
    group: "website",
  },
  {
    key: "onlineBookingPage",
    label: "Online booking page",
    description: "Public /book page — redirects guests to browse units and apply",
    group: "website",
  },
  {
    key: "guestRegistration",
    label: "Guest registration",
    description: "Allow new guests to create portal accounts",
    group: "portal",
  },
  {
    key: "guestEmailVerification",
    label: "Guest email verification",
    description: "Require 6-digit email verification for new guests",
    group: "portal",
  },
  {
    key: "portalGuestApply",
    label: "Rental applications",
    description: "Guests can submit rental applications in the portal",
    group: "portal",
  },
  {
    key: "portalMessages",
    label: "Portal messaging",
    description: "Guest and resident messaging with staff",
    group: "portal",
  },
  {
    key: "maintenanceRequests",
    label: "Maintenance requests",
    description: "Residents can submit maintenance requests",
    group: "portal",
  },
  {
    key: "onlineRentPayments",
    label: "Online rent payments",
    description: "Residents can pay rent with Stripe Checkout",
    group: "portal",
  },
  {
    key: "leaseSigning",
    label: "Lease signing",
    description: "Residents can review and sign leases in the portal",
    group: "portal",
  },
  {
    key: "documentManagement",
    label: "Document management",
    description: "Staff can upload documents and residents can download them",
    group: "portal",
  },
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Send portal event emails via Mailgun",
    group: "system",
  },
];

export const MARKETING_DEFINITIONS: Array<{
  key: keyof SystemConfig["marketing"];
  label: string;
  description: string;
}> = [
  {
    key: "showHero",
    label: "Hero banner",
    description: "Large homepage hero with property photo",
  },
  {
    key: "showWelcome",
    label: "Welcome section",
    description: "Introductory welcome block on homepage",
  },
  {
    key: "showAmenitiesPreview",
    label: "Amenities preview",
    description: "Amenities teaser on homepage",
  },
  {
    key: "showGalleryPreview",
    label: "Gallery preview",
    description: "Photo gallery teaser on homepage",
  },
  {
    key: "showNeighborhood",
    label: "Neighborhood section",
    description: "Neighborhood highlights on homepage",
  },
  {
    key: "showBookingTeaser",
    label: "Browse availability",
    description: "Floor plan / availability section on homepage",
  },
  {
    key: "showContactSection",
    label: "Contact section",
    description: "Contact form and office info on homepage",
  },
  {
    key: "showMapOnContact",
    label: "Map on contact",
    description: "Mapbox map in the contact section",
  },
];
