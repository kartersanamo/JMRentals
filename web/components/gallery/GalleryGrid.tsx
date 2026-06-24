"use client";

import { AnimateIn } from "@/components/ui/AnimateIn";
import type { GalleryImage } from "@/lib/site-config";
import type { SiteGalleryCategory } from "@/lib/settings/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";

const Lightbox = dynamic(
  () => import("@/components/gallery/Lightbox").then((mod) => mod.Lightbox),
  { ssr: false }
);

type Filter = "all" | string;

interface GalleryGridProps {
  images: GalleryImage[];
  categories?: SiteGalleryCategory[];
  preview?: boolean;
  previewCount?: number;
}

export function GalleryGrid({
  images,
  categories = [],
  preview = false,
  previewCount = 6,
}: GalleryGridProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? images
        : images.filter((img) => img.category === filter);
    return preview ? list.slice(0, previewCount) : list;
  }, [images, filter, preview, previewCount]);

  const filters = useMemo(() => {
    const dynamic = categories.map((category) => ({
      value: category.id,
      label: category.label,
    }));

    if (dynamic.length > 0) {
      return [{ value: "all" as const, label: "All" }, ...dynamic];
    }

    const uniqueIds = Array.from(new Set(images.map((image) => image.category)));
    return [
      { value: "all" as const, label: "All" },
      ...uniqueIds.map((id) => ({
        value: id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    ];
  }, [categories, images]);

  if (!preview && images.length === 0) {
    return (
      <p className="text-center text-navy/60 py-16">
        No gallery images yet. Check back soon.
      </p>
    );
  }

  return (
    <>
      {!preview && filters.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`px-6 py-2 text-sm uppercase tracking-widest transition-all ${
                filter === f.value
                  ? "bg-navy text-cream"
                  : "bg-transparent text-navy border border-navy/30 hover:border-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div
        className={`grid gap-4 ${
          preview
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {filtered.map((image, i) => (
          <AnimateIn key={`${image.src}-${i}`} delay={preview ? i * 0.05 : i * 0.04}>
            <button
              type="button"
              onClick={() => {
                const fullIndex = images.findIndex((img) => img.src === image.src);
                setLightboxIndex(fullIndex >= 0 ? fullIndex : i);
              }}
              className="group relative w-full overflow-hidden bg-navy/5 aspect-[4/3] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={
                  preview
                    ? "(max-width: 768px) 50vw, 33vw"
                    : "(max-width: 768px) 100vw, 33vw"
                }
              />
              <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-colors duration-300" />
              <span className="absolute bottom-3 left-3 text-xs uppercase tracking-widest text-cream opacity-0 group-hover:opacity-100 transition-opacity">
                View
              </span>
            </button>
          </AnimateIn>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
