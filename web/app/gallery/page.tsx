import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "View interior and exterior photos of J&M Rentals properties in Larose, Louisiana.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Explore Our Beautiful Homes"
        subtitle="Step inside renovated interiors and stroll through charming exteriors along the Larose bayou."
      />
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-7xl">
          <GalleryGrid images={site.gallery} />
        </div>
      </section>
    </>
  );
}
