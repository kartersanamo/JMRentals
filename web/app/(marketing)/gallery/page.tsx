import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHero } from "@/components/layout/PageHero";
import { getSiteContent, isFeatureEnabled } from "@/lib/settings/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "View interior and exterior photos of J&M Rentals properties in Larose, Louisiana.",
};

export default async function GalleryPage() {
  if (!(await isFeatureEnabled("publicGallery"))) {
    redirect("/");
  }

  const siteContent = await getSiteContent();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Explore Our Beautiful Homes"
        subtitle="Step inside renovated interiors and stroll through charming exteriors along the Larose bayou."
      />
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-7xl">
          <GalleryGrid images={siteContent.gallery} />
        </div>
      </section>
    </>
  );
}
