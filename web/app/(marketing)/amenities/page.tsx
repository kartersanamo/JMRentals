import { AmenityGrid } from "@/components/amenities/AmenityGrid";
import { PageHero } from "@/components/layout/PageHero";
import { getRuntimeSite, isFeatureEnabled } from "@/lib/settings/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "Explore the full list of amenities at J&M Rentals in Larose, LA — modern finishes, climate control, parking, and more.",
};

export default async function AmenitiesPage() {
  if (!(await isFeatureEnabled("publicAmenitiesPage"))) {
    redirect("/");
  }

  const runtimeSite = await getRuntimeSite();

  return (
    <>
      <PageHero
        eyebrow="Amenities"
        title="A Premier Living Experience"
        subtitle="Every detail at J&M Rentals is designed for comfort, convenience, and the relaxed pace of bayou-country living."
      />
      <section className="section-padding bg-sage-light">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-navy/70 max-w-2xl mx-auto mb-14 text-lg leading-relaxed">
            From renovated interiors to thoughtful community perks, discover
            everything that makes our Larose properties feel like home.
          </p>
          <AmenityGrid amenities={runtimeSite.amenities} />
        </div>
      </section>
    </>
  );
}
