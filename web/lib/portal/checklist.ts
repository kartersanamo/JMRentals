import { db } from "@/lib/db";

export async function getDefaultChecklist() {
  const setting = await db.portalSetting.findUnique({
    where: { key: "default_checklist" },
  });
  if (!setting) return {};
  try {
    return JSON.parse(setting.value);
  } catch {
    return {};
  }
}
