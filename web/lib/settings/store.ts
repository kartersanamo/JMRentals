import { db } from "@/lib/db";
import { normalizeGalleryContent } from "@/lib/gallery-categories";
import { site } from "@/lib/site-config";
import { cache } from "react";
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_SYSTEM_CONFIG,
  SITE_CONTENT_KEY,
  SYSTEM_CONFIG_KEY,
} from "./defaults";
import type { SiteContent, SystemConfig } from "./types";

function canUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function deepMergeSystemConfig(partial: Partial<SystemConfig>): SystemConfig {
  return {
    features: { ...DEFAULT_SYSTEM_CONFIG.features, ...partial.features },
    marketing: { ...DEFAULT_SYSTEM_CONFIG.marketing, ...partial.marketing },
  };
}

function deepMergeSiteContent(partial: Partial<SiteContent>): SiteContent {
  const merged = {
    ...DEFAULT_SITE_CONTENT,
    ...partial,
    address: { ...DEFAULT_SITE_CONTENT.address, ...partial.address },
    coordinates: { ...DEFAULT_SITE_CONTENT.coordinates, ...partial.coordinates },
    social: { ...DEFAULT_SITE_CONTENT.social, ...partial.social },
    hours: partial.hours ?? DEFAULT_SITE_CONTENT.hours,
    neighborhood: partial.neighborhood ?? DEFAULT_SITE_CONTENT.neighborhood,
    gallery: partial.gallery ?? DEFAULT_SITE_CONTENT.gallery,
    galleryCategories:
      partial.galleryCategories ?? DEFAULT_SITE_CONTENT.galleryCategories,
    floorPlans: partial.floorPlans ?? DEFAULT_SITE_CONTENT.floorPlans,
  };

  const normalized = normalizeGalleryContent({
    gallery: merged.gallery,
    galleryCategories: merged.galleryCategories,
  });

  return {
    ...merged,
    galleryCategories: normalized.galleryCategories,
    gallery: normalized.gallery,
  };
}

async function readJsonSetting<T>(key: string): Promise<Partial<T> | null> {
  if (!canUseDatabase()) return null;

  try {
    const row = await db.portalSetting.findUnique({ where: { key } });
    if (!row?.value) return null;
    return JSON.parse(row.value) as Partial<T>;
  } catch {
    return null;
  }
}

export const getSystemConfig = cache(async (): Promise<SystemConfig> => {
  const stored = await readJsonSetting<SystemConfig>(SYSTEM_CONFIG_KEY);
  return deepMergeSystemConfig(stored ?? {});
});

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const stored = await readJsonSetting<SiteContent>(SITE_CONTENT_KEY);
  return deepMergeSiteContent(stored ?? {});
});

export async function getRuntimeSite() {
  const content = await getSiteContent();
  return {
    ...content,
    amenities: site.amenities,
    bookingEnabled: false,
  };
}

export function getFullAddressFromContent(content: SiteContent): string {
  const { street, city, state, zip } = content.address;
  return `${street}, ${city}, ${state} ${zip}`;
}

export async function isFeatureEnabled(
  key: keyof SystemConfig["features"]
): Promise<boolean> {
  const config = await getSystemConfig();
  return config.features[key];
}

export async function isMarketingEnabled(
  key: keyof SystemConfig["marketing"]
): Promise<boolean> {
  const config = await getSystemConfig();
  return config.marketing[key];
}

export async function saveSystemConfig(config: SystemConfig): Promise<void> {
  if (!canUseDatabase()) {
    throw new Error("DATABASE_URL is not configured");
  }

  await db.portalSetting.upsert({
    where: { key: SYSTEM_CONFIG_KEY },
    create: {
      key: SYSTEM_CONFIG_KEY,
      value: JSON.stringify(config, null, 2),
    },
    update: { value: JSON.stringify(config, null, 2) },
  });
}

export function getDirectionsUrlFromContent(content: SiteContent): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getFullAddressFromContent(content))}`;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!canUseDatabase()) {
    throw new Error("DATABASE_URL is not configured");
  }

  await db.portalSetting.upsert({
    where: { key: SITE_CONTENT_KEY },
    create: {
      key: SITE_CONTENT_KEY,
      value: JSON.stringify(content, null, 2),
    },
    update: { value: JSON.stringify(content, null, 2) },
  });
}
