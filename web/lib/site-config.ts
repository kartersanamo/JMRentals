import type { LucideIcon } from "lucide-react";
import {
  AirVent,
  Bath,
  Car,
  Clock,
  Droplets,
  Home,
  MapPin,
  Paintbrush,
  Plug,
  Route,
  Shield,
  ShoppingBag,
  Trees,
  WashingMachine,
  Waves,
} from "lucide-react";

export type GalleryCategory = "inside" | "outside";

export interface GalleryImage {
  src: string;
  category: GalleryCategory;
  alt: string;
}

export interface Amenity {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface OfficeHour {
  day: string;
  open: string | null;
  close: string | null;
  closed?: boolean;
}

export const site = {
  name: "J&M Rentals",
  legalName: "J&M Rentals LLC",
  tagline: "Bayou-side living in the heart of Larose",
  description:
    "Discover beautifully renovated rental homes along the bayou in Larose, Louisiana. Comfortable interiors, thoughtful amenities, and a welcoming community await you at J&M Rentals.",
  bookingEnabled: false,
  address: {
    street: "12918 S Main St",
    city: "Larose",
    state: "LA",
    zip: "70373",
  },
  coordinates: {
    lng: -90.3817,
    lat: 29.5765,
  },
  phone: "(985) 000-0000",
  email: "info@jmrentals.com",
  termsLastUpdated: "June 3, 2026",
  privacyLastUpdated: "June 3, 2026",
  hours: [
    { day: "Monday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Tuesday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Thursday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Friday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Saturday", open: null, close: null, closed: true },
    { day: "Sunday", open: null, close: null, closed: true },
  ] as OfficeHour[],
  social: {
    facebook:
      "https://www.facebook.com/p/J-M-Rentals-LLC-61571802064389/",
  },
  neighborhood: [
    "Restaurants & local Cajun cuisine",
    "Bayou views & outdoor recreation",
    "Charming Larose community",
    "Grocery stores & essentials nearby",
    "Schools & post office within minutes",
    "Easy access to LA Hwy 1",
    "Fishing & waterfront lifestyle",
    "Regional shopping in Thibodaux & Houma",
  ],
  floorPlans: [
    {
      name: "Studio Retreat",
      beds: "Studio",
      baths: "1 Bath",
      description: "Cozy bayou-side living with modern finishes.",
    },
    {
      name: "One Bedroom Classic",
      beds: "1 Bed",
      baths: "1 Bath",
      description: "Spacious layout perfect for comfortable everyday living.",
    },
    {
      name: "Two Bedroom Home",
      beds: "2 Beds",
      baths: "1.5 Baths",
      description: "Renovated home with room to spread out and unwind.",
    },
  ],
  amenities: [
    {
      title: "Central Air & Heat",
      description:
        "Stay comfortable year-round with modern central climate control.",
      icon: AirVent,
    },
    {
      title: "Newly Renovated Interiors",
      description:
        "Fresh updates throughout — move-in ready and beautifully maintained.",
      icon: Home,
    },
    {
      title: "Updated Plumbing",
      description: "Modern plumbing for reliable everyday convenience.",
      icon: Droplets,
    },
    {
      title: "Updated Electrical",
      description: "Up-to-date wiring for peace of mind in your new home.",
      icon: Plug,
    },
    {
      title: "Fresh Paint & Flooring",
      description:
        "Clean, contemporary finishes that make every room feel inviting.",
      icon: Paintbrush,
    },
    {
      title: "Washer & Dryer Hookups",
      description: "In-unit laundry hookups available for your convenience.",
      icon: WashingMachine,
    },
    {
      title: "Private Driveway & Parking",
      description: "Dedicated parking right at your doorstep.",
      icon: Car,
    },
    {
      title: "Quiet Larose Setting",
      description:
        "Enjoy peaceful residential living in a welcoming bayou community.",
      icon: Trees,
    },
    {
      title: "Minutes to Essentials",
      description:
        "Close to grocery, post office, schools, and everyday errands.",
      icon: ShoppingBag,
    },
    {
      title: "Bayou-Country Lifestyle",
      description:
        "Experience the beauty and charm of Louisiana's bayou country.",
      icon: Waves,
    },
    {
      title: "Easy Hwy 1 Access",
      description: "Convenient regional access along Louisiana Highway 1.",
      icon: Route,
    },
    {
      title: "Responsive Management",
      description:
        "Dedicated on-site management focused on your comfort and needs.",
      icon: Shield,
    },
    {
      title: "Flexible Lease Options",
      description: "12-month lease terms designed for stable, long-term living.",
      icon: Clock,
    },
    {
      title: "Updated Bathrooms",
      description: "Clean, refreshed bath spaces with modern fixtures.",
      icon: Bath,
    },
    {
      title: "Prime Larose Location",
      description:
        "Situated on S Main St in the heart of Larose, LA 70373.",
      icon: MapPin,
    },
  ] as Amenity[],
  gallery: [
    {
      src: "/images/Outside.jpg",
      category: "outside",
      alt: "Exterior view of J&M Rentals property in Larose",
    },
    {
      src: "/images/Outside2.jpg",
      category: "outside",
      alt: "Property exterior detail",
    },
    {
      src: "/images/Outside3.jpg",
      category: "outside",
      alt: "Outdoor area of the rental property",
    },
    {
      src: "/images/Outside4.jpg",
      category: "outside",
      alt: "Beautiful exterior of the rental home",
    },
    {
      src: "/images/Inside1.jpg",
      category: "inside",
      alt: "Bright renovated living space interior",
    },
    {
      src: "/images/Inside2.jpg",
      category: "inside",
      alt: "Modern interior with updated finishes",
    },
    {
      src: "/images/Inside3.jpg",
      category: "inside",
      alt: "Comfortable interior room at J&M Rentals",
    },
    {
      src: "/images/Inside4.jpg",
      category: "inside",
      alt: "Spacious interior living area",
    },
    {
      src: "/images/Inside5.jpg",
      category: "inside",
      alt: "Updated interior with fresh paint and flooring",
    },
    {
      src: "/images/Inside6.jpg",
      category: "inside",
      alt: "Inviting interior space in Larose rental",
    },
  ] as GalleryImage[],
  heroImage: "/images/Outside.jpg",
};

export function getFullAddress(): string {
  const { street, city, state, zip } = site.address;
  return `${street}, ${city}, ${state} ${zip}`;
}

export function getDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddress())}`;
}

export function getMapboxStyle(): string {
  return (
    process.env.NEXT_PUBLIC_MAPBOX_STYLE ??
    "mapbox://styles/mapbox/light-v11"
  );
}
