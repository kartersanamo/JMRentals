export const DEFAULT_UNIT_IMAGES: Record<string, string> = {
  "Studio Retreat": "/images/Inside6.jpg",
  "One Bedroom Classic": "/images/Inside2.jpg",
  "Two Bedroom Home": "/images/Inside4.jpg",
};

export const DEFAULT_UNIT_IMAGE = "/images/Inside1.jpg";

export function getUnitImageUrl(
  imageUrl?: string | null,
  unitName?: string
): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (unitName && DEFAULT_UNIT_IMAGES[unitName]) {
    return DEFAULT_UNIT_IMAGES[unitName];
  }
  return DEFAULT_UNIT_IMAGE;
}

export function getUnitImageAlt(name: string): string {
  return `${name} at J&M Rentals in Larose, Louisiana`;
}
