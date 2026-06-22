import type { SiteGalleryImage } from "@/lib/settings/types";

export const CUSTOM_GALLERY_VALUE = "__custom__";

export function isGalleryPresetUrl(
  url: string,
  gallery: SiteGalleryImage[]
): boolean {
  return gallery.some((image) => image.src === url);
}

export function resolveImagePickerValue(
  mode: "gallery" | "custom",
  galleryValue: string,
  customValue: string
): string {
  return mode === "gallery" ? galleryValue : customValue.trim();
}

export function getInitialImagePickerState(
  value: string,
  gallery: SiteGalleryImage[]
): {
  mode: "gallery" | "custom";
  galleryValue: string;
  customValue: string;
} {
  const trimmed = value.trim();
  if (trimmed && isGalleryPresetUrl(trimmed, gallery)) {
    return { mode: "gallery", galleryValue: trimmed, customValue: "" };
  }

  if (trimmed) {
    return {
      mode: "custom",
      galleryValue: "",
      customValue: trimmed,
    };
  }

  return {
    mode: "gallery",
    galleryValue: "",
    customValue: "",
  };
}

export function formatGalleryOptionLabel(image: SiteGalleryImage): string {
  const category =
    image.category === "inside" ? "Inside" : "Outside";
  return `${image.alt} (${category})`;
}
