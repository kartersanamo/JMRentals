import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { updatePortalSetting } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await db.portalSetting.findMany();
  const homeInfo = settings.find((s) => s.key === "home_info");
  const checklist = settings.find((s) => s.key === "default_checklist");

  return (
    <div>
      <PortalPageHeader title="Portal Settings" />
      <PortalCard title="Home Info (JSON)" className="mb-8">
        <ActionForm action={updatePortalSetting} successMessage="Home info updated." className="space-y-3">
          <input type="hidden" name="key" value="home_info" />
          <textarea
            name="value"
            rows={10}
            defaultValue={homeInfo?.value ?? "{}"}
            className="w-full border border-navy/20 px-4 py-3 font-mono text-sm bg-white resize-y"
          />
        </ActionForm>
      </PortalCard>
      <PortalCard title="Default Move-In Checklist (JSON)">
        <ActionForm action={updatePortalSetting} successMessage="Checklist updated." className="space-y-3">
          <input type="hidden" name="key" value="default_checklist" />
          <textarea
            name="value"
            rows={8}
            defaultValue={checklist?.value ?? "{}"}
            className="w-full border border-navy/20 px-4 py-3 font-mono text-sm bg-white resize-y"
          />
        </ActionForm>
      </PortalCard>
    </div>
  );
}
