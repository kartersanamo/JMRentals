import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { updatePortalSetting } from "@/lib/actions/portal";
import { db } from "@/lib/db";
import { prettyJsonString } from "@/lib/json";

export default async function AdminSettingsPage() {
  const settings = await db.portalSetting.findMany();
  const homeInfo = settings.find((s) => s.key === "home_info");
  const checklist = settings.find((s) => s.key === "default_checklist");

  return (
    <div>
      <PortalPageHeader title="Portal Settings" />
      <PortalCard title="Home Info (JSON)" className="mb-8">
        <p className="text-sm text-navy/60 mb-4">
          Resident home-info sections (utilities, trash, parking, etc.). Use valid JSON with quoted keys.
        </p>
        <ActionForm
          action={updatePortalSetting}
          successMessage="Home info updated."
          submitLabel="Save home info"
          className="space-y-3"
        >
          <input type="hidden" name="key" value="home_info" />
          <textarea
            name="value"
            rows={14}
            defaultValue={prettyJsonString(homeInfo?.value)}
            spellCheck={false}
            className="w-full border border-navy/20 px-4 py-3 font-mono text-sm leading-relaxed bg-white resize-y"
          />
        </ActionForm>
      </PortalCard>
      <PortalCard title="Default Move-In Checklist (JSON)">
        <p className="text-sm text-navy/60 mb-4">
          Checklist items for new residents. Each key is a task label; use{" "}
          <code className="text-xs bg-navy/5 px-1">true</code> or{" "}
          <code className="text-xs bg-navy/5 px-1">false</code> for completion.
        </p>
        <ActionForm
          action={updatePortalSetting}
          successMessage="Checklist updated."
          submitLabel="Save checklist"
          className="space-y-3"
        >
          <input type="hidden" name="key" value="default_checklist" />
          <textarea
            name="value"
            rows={12}
            defaultValue={prettyJsonString(checklist?.value)}
            spellCheck={false}
            className="w-full border border-navy/20 px-4 py-3 font-mono text-sm leading-relaxed bg-white resize-y"
          />
        </ActionForm>
      </PortalCard>
    </div>
  );
}
