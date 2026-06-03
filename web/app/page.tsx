import { AmenitiesPreview } from "@/components/home/AmenitiesPreview";
import { BookingTeaser } from "@/components/home/BookingTeaser";
import { ContactSection } from "@/components/home/ContactSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { Neighborhood } from "@/components/home/Neighborhood";
import { Welcome } from "@/components/home/Welcome";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Welcome />
      <AmenitiesPreview />
      <GalleryPreview />
      <Neighborhood />
      <BookingTeaser />
      <ContactSection />
    </>
  );
}
