import { AmenitiesPreview } from "@/components/home/AmenitiesPreview";
import { BookingTeaser } from "@/components/home/BookingTeaser";
import { ContactSection } from "@/components/home/ContactSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { Neighborhood } from "@/components/home/Neighborhood";
import { Welcome } from "@/components/home/Welcome";
import {
  getRuntimeSite,
  getSiteContent,
  getSystemConfig,
} from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, siteContent, runtimeSite] = await Promise.all([
    getSystemConfig(),
    getSiteContent(),
    getRuntimeSite(),
  ]);

  return (
    <>
      {config.marketing.showHero && (
        <Hero
          name={siteContent.name}
          tagline={siteContent.tagline}
          heroImage={siteContent.heroImage}
        />
      )}
      {config.marketing.showWelcome && (
        <Welcome
          description={siteContent.description}
          galleryImage={siteContent.gallery[4]?.src ?? siteContent.heroImage}
        />
      )}
      {config.marketing.showAmenitiesPreview && config.features.publicAmenitiesPage && (
        <AmenitiesPreview />
      )}
      {config.marketing.showGalleryPreview && config.features.publicGallery && (
        <GalleryPreview
          images={siteContent.gallery}
          categories={siteContent.galleryCategories}
        />
      )}
      {config.marketing.showNeighborhood && (
        <Neighborhood items={siteContent.neighborhood} />
      )}
      {config.marketing.showBookingTeaser && (
        <BookingTeaser floorPlans={runtimeSite.floorPlans} />
      )}
      {config.marketing.showContactSection && (
        <ContactSection
          content={siteContent}
          showForm={config.features.contactForm}
          showMap={config.marketing.showMapOnContact}
        />
      )}
    </>
  );
}
