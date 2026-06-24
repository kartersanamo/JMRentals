import { AdminCommandCenter } from "@/components/admin/AdminCommandCenter";
import { PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";
import { prettyJsonString } from "@/lib/json";
import {
  getSiteContent,
  getSystemConfig,
} from "@/lib/settings/store";
import {
  getRecentAuditLogs,
  getSystemDataStats,
  getSystemStatusChecks,
} from "@/lib/settings/system-status";

export default async function AdminSettingsPage() {
  const [
    systemConfig,
    siteContent,
    statusChecks,
    stats,
    auditLogs,
    portalSettings,
  ] = await Promise.all([
    getSystemConfig(),
    getSiteContent(),
    getSystemStatusChecks(),
    getSystemDataStats(),
    getRecentAuditLogs(75),
    db.portalSetting.findMany(),
  ]);

  const homeInfo = portalSettings.find((s) => s.key === "home_info");

  return (
    <div>
      <PortalPageHeader
        title="System Control"
        subtitle="Manage features, website content, portal settings, system health, and activity."
      />
      <AdminCommandCenter
        systemConfig={systemConfig}
        siteContent={siteContent}
        statusChecks={statusChecks}
        stats={stats}
        auditLogs={auditLogs}
        homeInfoJson={prettyJsonString(homeInfo?.value, "{}")}
      />
    </div>
  );
}
