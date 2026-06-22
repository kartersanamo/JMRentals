"use server";

import { createAuditLog } from "@/lib/audit";
import { normalizeJsonString } from "@/lib/json";
import { requireRole } from "@/lib/auth";
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_SYSTEM_CONFIG,
} from "@/lib/settings/defaults";
import {
  getSiteContent,
  getSystemConfig,
  saveSiteContent,
  saveSystemConfig,
} from "@/lib/settings/store";
import { normalizeGalleryContent } from "@/lib/gallery-categories";
import type { SiteContent, SystemConfig } from "@/lib/settings/types";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/portal", "layout");
  revalidatePath("/gallery");
  revalidatePath("/amenities");
  revalidatePath("/book");
}

export async function updateSystemFeatures(formData: FormData) {
  const session = await requireRole("ADMIN");
  const current = await getSystemConfig();

  const features = { ...current.features };
  for (const key of Object.keys(DEFAULT_SYSTEM_CONFIG.features) as Array<
    keyof SystemConfig["features"]
  >) {
    const val = formData.get(`feature_${key}`);
    if (val !== null) {
      features[key] = val === "on";
    }
  }

  const marketing = { ...current.marketing };
  for (const key of Object.keys(DEFAULT_SYSTEM_CONFIG.marketing) as Array<
    keyof SystemConfig["marketing"]
  >) {
    const val = formData.get(`marketing_${key}`);
    if (val !== null) {
      marketing[key] = val === "on";
    }
  }

  await saveSystemConfig({ features, marketing });

  await createAuditLog({
    actorId: session.user.id,
    action: "SYSTEM_FEATURES_UPDATED",
    targetType: "PortalSetting",
    details: "Feature toggles and marketing sections updated",
  });

  revalidateAll();
  return { success: true };
}

export async function updateSiteContentFields(formData: FormData) {
  const session = await requireRole("ADMIN");
  const current = await getSiteContent();

  const content: SiteContent = {
    ...current,
    name: String(formData.get("name") ?? current.name).trim(),
    legalName: String(formData.get("legalName") ?? current.legalName).trim(),
    tagline: String(formData.get("tagline") ?? current.tagline).trim(),
    description: String(formData.get("description") ?? current.description).trim(),
    phone: String(formData.get("phone") ?? current.phone).trim(),
    email: String(formData.get("email") ?? current.email).trim(),
    termsLastUpdated: String(
      formData.get("termsLastUpdated") ?? current.termsLastUpdated
    ).trim(),
    privacyLastUpdated: String(
      formData.get("privacyLastUpdated") ?? current.privacyLastUpdated
    ).trim(),
    heroImage: String(formData.get("heroImage") ?? current.heroImage).trim(),
    address: {
      street: String(formData.get("street") ?? current.address.street).trim(),
      city: String(formData.get("city") ?? current.address.city).trim(),
      state: String(formData.get("state") ?? current.address.state).trim(),
      zip: String(formData.get("zip") ?? current.address.zip).trim(),
    },
    coordinates: {
      lng: Number(formData.get("lng") ?? current.coordinates.lng),
      lat: Number(formData.get("lat") ?? current.coordinates.lat),
    },
    social: {
      facebook: String(
        formData.get("facebook") ?? current.social.facebook
      ).trim(),
    },
  };

  await saveSiteContent(content);

  await createAuditLog({
    actorId: session.user.id,
    action: "SITE_CONTENT_UPDATED",
    targetType: "PortalSetting",
    details: "Business and website content updated",
  });

  revalidateAll();
  return { success: true };
}

export async function updateSiteLists(formData: FormData) {
  const session = await requireRole("ADMIN");
  const current = await getSiteContent();
  const listKey = String(formData.get("listKey"));

  if (listKey === "neighborhood") {
    const raw = String(formData.get("value") ?? "");
    const neighborhood = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    await saveSiteContent({ ...current, neighborhood });
  } else if (listKey === "hours") {
    const raw = String(formData.get("value") ?? "");
    const parsed = normalizeJsonString(raw);
    if (!parsed.ok) return { error: parsed.error };
    await saveSiteContent({
      ...current,
      hours: JSON.parse(parsed.value),
    });
  } else {
    return { error: "Unknown list type." };
  }

  await createAuditLog({
    actorId: session.user.id,
    action: "SITE_LISTS_UPDATED",
    targetType: "PortalSetting",
    details: listKey,
  });

  revalidateAll();
  return { success: true };
}

export async function updatePortalSettingJson(formData: FormData) {
  const session = await requireRole("ADMIN");
  const key = String(formData.get("key"));
  const raw = String(formData.get("value"));

  const parsed = normalizeJsonString(raw);
  if (!parsed.ok) return { error: parsed.error };

  const { db } = await import("@/lib/db");
  await db.portalSetting.upsert({
    where: { key },
    create: { key, value: parsed.value },
    update: { value: parsed.value },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "SETTING_UPDATED",
    targetType: "PortalSetting",
    details: key,
  });

  revalidateAll();
  return { success: true };
}

export async function updateSiteGallery(formData: FormData) {
  const session = await requireRole("ADMIN");
  const current = await getSiteContent();
  const rawGallery = String(formData.get("galleryJson") ?? "");
  const rawCategories = String(formData.get("galleryCategoriesJson") ?? "");

  let parsedGallery: unknown;
  let parsedCategories: unknown;
  try {
    parsedGallery = JSON.parse(rawGallery);
    parsedCategories = JSON.parse(rawCategories);
  } catch {
    return { error: "Invalid gallery data." };
  }

  const { gallery, galleryCategories } = normalizeGalleryContent({
    gallery: parsedGallery,
    galleryCategories: parsedCategories,
  });

  if (galleryCategories.length === 0) {
    return { error: "Add at least one gallery category." };
  }

  if (gallery.length === 0) {
    return { error: "Add at least one gallery photo with a URL and alt text." };
  }

  await saveSiteContent({ ...current, gallery, galleryCategories });

  await createAuditLog({
    actorId: session.user.id,
    action: "SITE_GALLERY_UPDATED",
    targetType: "PortalSetting",
    details: `${gallery.length} photo(s), ${galleryCategories.length} categor${galleryCategories.length === 1 ? "y" : "ies"}`,
  });

  revalidateAll();
  return { success: true };
}

export async function resetSystemConfigDefaults() {
  const session = await requireRole("ADMIN");
  await saveSystemConfig(DEFAULT_SYSTEM_CONFIG);

  await createAuditLog({
    actorId: session.user.id,
    action: "SYSTEM_CONFIG_RESET",
    targetType: "PortalSetting",
    details: "Reset to default feature toggles",
  });

  revalidateAll();
  return { success: true };
}

export async function resetSiteContentDefaults() {
  const session = await requireRole("ADMIN");
  await saveSiteContent(DEFAULT_SITE_CONTENT);

  await createAuditLog({
    actorId: session.user.id,
    action: "SITE_CONTENT_RESET",
    targetType: "PortalSetting",
    details: "Reset website content to defaults",
  });

  revalidateAll();
  return { success: true };
}
