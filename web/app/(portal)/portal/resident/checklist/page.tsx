import { ChecklistForm } from "@/components/portal/ChecklistForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ResidentChecklistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [profile, defaultSetting] = await Promise.all([
    db.residentProfile.findUnique({ where: { userId: session.user.id } }),
    db.portalSetting.findUnique({ where: { key: "default_checklist" } }),
  ]);

  let defaultChecklist: Record<string, boolean> = {};
  try {
    defaultChecklist = defaultSetting ? JSON.parse(defaultSetting.value) : {};
  } catch {
    defaultChecklist = {};
  }

  const progress = (profile?.checklistProgress as Record<string, boolean> | null) ?? defaultChecklist;

  return (
    <div>
      <PortalPageHeader title="Move-In Checklist" subtitle="Track your move-in tasks." />
      <PortalCard>
        <ChecklistForm initial={progress} />
      </PortalCard>
    </div>
  );
}
