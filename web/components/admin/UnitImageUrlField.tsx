"use client";

import { ImageUrlPicker } from "@/components/admin/ImageUrlPicker";
import type { SiteGalleryImage } from "@/lib/settings/types";

const fieldClass = "border border-navy/20 px-4 py-3 bg-white w-full";
const fieldClassSm = "border border-navy/20 px-3 py-2 text-sm bg-white w-full";

export function UnitImageUrlField({
  idPrefix,
  defaultValue = "",
  galleryImages,
  compact = false,
}: {
  idPrefix: string;
  defaultValue?: string;
  galleryImages: SiteGalleryImage[];
  compact?: boolean;
}) {
  return (
    <ImageUrlPicker
      name="imageUrl"
      inputId={`${idPrefix}-image`}
      label="Photo"
      defaultValue={defaultValue}
      galleryImages={galleryImages}
      inputClassName={compact ? fieldClassSm : fieldClass}
      compact={compact}
    />
  );
}
