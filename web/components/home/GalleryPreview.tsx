import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site-config";

export function GalleryPreview() {
  return (
    <section id="gallery" className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Explore J&M Rentals"
          title="The Lifestyle You Deserve"
          subtitle="Browse our gallery of beautifully renovated interiors and stunning exteriors. Don't just take our word for it — see for yourself."
        />
        <GalleryGrid images={site.gallery} preview previewCount={6} />
        <div className="mt-14 text-center">
          <ButtonLink href="/gallery" variant="outline" size="lg">
            See All Photos
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
