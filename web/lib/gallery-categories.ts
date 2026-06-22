import type { SiteGalleryCategory, SiteGalleryImage } from "@/lib/settings/types";

export const DEFAULT_GALLERY_CATEGORIES: SiteGalleryCategory[] = [
  { id: "inside", label: "Inside" },
  { id: "outside", label: "Outside" },
];

export function slugifyGalleryCategoryId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function uniqueGalleryCategoryId(
  label: string,
  existingIds: string[]
): string {
  const base = slugifyGalleryCategoryId(label) || "category";
  if (!existingIds.includes(base)) return base;

  let index = 2;
  while (existingIds.includes(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

export function humanizeGalleryCategoryId(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeGalleryCategories(
  categories: unknown,
  gallery?: SiteGalleryImage[]
): SiteGalleryCategory[] {
  const normalized: SiteGalleryCategory[] = [];

  if (Array.isArray(categories)) {
    for (const entry of categories) {
      const id = String(entry?.id ?? "").trim();
      const label = String(entry?.label ?? "").trim();
      if (!id || !label) continue;
      if (normalized.some((item) => item.id === id)) continue;
      normalized.push({ id, label });
    }
  }

  if (normalized.length === 0) {
    return DEFAULT_GALLERY_CATEGORIES.map((item) => ({ ...item }));
  }

  if (gallery) {
    for (const image of gallery) {
      const id = String(image.category ?? "").trim();
      if (!id || normalized.some((item) => item.id === id)) continue;
      normalized.push({ id, label: humanizeGalleryCategoryId(id) });
    }
  }

  return normalized;
}

export function getGalleryCategoryLabel(
  categoryId: string,
  categories: SiteGalleryCategory[]
): string {
  return (
    categories.find((item) => item.id === categoryId)?.label ??
    humanizeGalleryCategoryId(categoryId)
  );
}

export function normalizeGalleryImages(
  images: unknown,
  categories: SiteGalleryCategory[]
): SiteGalleryImage[] {
  if (!Array.isArray(images)) return [];

  const fallbackCategoryId = categories[0]?.id ?? "inside";

  return images
    .map((item) => {
      const src = String(item?.src ?? "").trim();
      const alt = String(item?.alt ?? "").trim();
      const rawCategory = String(item?.category ?? "").trim();
      const category = categories.some((entry) => entry.id === rawCategory)
        ? rawCategory
        : fallbackCategoryId;
      return { src, alt, category };
    })
    .filter((item) => item.src && item.alt);
}

export function normalizeGalleryContent(input: {
  gallery?: unknown;
  galleryCategories?: unknown;
}): {
  galleryCategories: SiteGalleryCategory[];
  gallery: SiteGalleryImage[];
} {
  const galleryCategories = normalizeGalleryCategories(
    input.galleryCategories,
    Array.isArray(input.gallery)
      ? (input.gallery as SiteGalleryImage[])
      : undefined
  );
  const gallery = normalizeGalleryImages(input.gallery, galleryCategories);
  return { galleryCategories, gallery };
}
