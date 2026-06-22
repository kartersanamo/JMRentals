import type { GalleryCategory } from "@/lib/site-config";

export type FeatureKey =
  | "contactForm"
  | "guestRegistration"
  | "publicGallery"
  | "publicAmenitiesPage"
  | "onlineBookingPage"
  | "portalGuestApply"
  | "portalMessages"
  | "emailNotifications"
  | "maintenanceRequests"
  | "guestEmailVerification"
  | "onlineRentPayments"
  | "leaseSigning"
  | "documentManagement";

export type MarketingKey =
  | "showHero"
  | "showWelcome"
  | "showAmenitiesPreview"
  | "showGalleryPreview"
  | "showNeighborhood"
  | "showBookingTeaser"
  | "showContactSection"
  | "showMapOnContact";

export interface SystemFeatures {
  contactForm: boolean;
  guestRegistration: boolean;
  publicGallery: boolean;
  publicAmenitiesPage: boolean;
  onlineBookingPage: boolean;
  portalGuestApply: boolean;
  portalMessages: boolean;
  emailNotifications: boolean;
  maintenanceRequests: boolean;
  guestEmailVerification: boolean;
  onlineRentPayments: boolean;
  leaseSigning: boolean;
  documentManagement: boolean;
}

export interface MarketingSections {
  showHero: boolean;
  showWelcome: boolean;
  showAmenitiesPreview: boolean;
  showGalleryPreview: boolean;
  showNeighborhood: boolean;
  showBookingTeaser: boolean;
  showContactSection: boolean;
  showMapOnContact: boolean;
}

export interface SystemConfig {
  features: SystemFeatures;
  marketing: MarketingSections;
}

export interface SiteAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface SiteCoordinates {
  lng: number;
  lat: number;
}

export interface SiteOfficeHour {
  day: string;
  open: string | null;
  close: string | null;
  closed?: boolean;
}

export interface SiteGalleryImage {
  src: string;
  category: GalleryCategory;
  alt: string;
}

export interface SiteFloorPlan {
  name: string;
  beds: string;
  baths: string;
  description: string;
  imageUrl: string;
}

export interface SiteContent {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  termsLastUpdated: string;
  privacyLastUpdated: string;
  heroImage: string;
  address: SiteAddress;
  coordinates: SiteCoordinates;
  social: { facebook: string };
  hours: SiteOfficeHour[];
  neighborhood: string[];
  gallery: SiteGalleryImage[];
  floorPlans: SiteFloorPlan[];
}

export interface SystemStatusCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
}

export interface SystemDataStats {
  users: number;
  guests: number;
  residents: number;
  staff: number;
  admins: number;
  units: number;
  availableUnits: number;
  applications: number;
  pendingApplications: number;
  maintenanceOpen: number;
  leases: number;
  messages: number;
  announcements: number;
  auditEvents: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actorName: string;
  actorEmail: string;
}
