import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { getSystemConfig } from "@/lib/settings/store";
import {
  getSystemDataStats,
  getSystemStatusChecks,
} from "@/lib/settings/system-status";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, statusChecks, systemConfig] = await Promise.all([
    getSystemDataStats(),
    getSystemStatusChecks(),
    getSystemConfig(),
  ]);

  const overallStatus = statusChecks.some((c) => c.status === "error")
    ? "Needs attention"
    : statusChecks.some((c) => c.status === "warn")
      ? "Partial"
      : "Healthy";

  const disabledFeatures = Object.entries(systemConfig.features).filter(
    ([, enabled]) => !enabled
  ).length;

  return (
    <div>
      <PortalPageHeader
        title="Admin Dashboard"
        subtitle="System overview — open System Control for full configuration."
      />
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <PortalCard title="Total Users">
          <p className="text-3xl font-display text-navy">{stats.users}</p>
        </PortalCard>
        <PortalCard title="Units">
          <p className="text-3xl font-display text-navy">{stats.units}</p>
          <p className="text-sm text-navy/50 mt-1">{stats.availableUnits} available</p>
        </PortalCard>
        <PortalCard title="Pending Apps">
          <p className="text-3xl font-display text-navy">{stats.pendingApplications}</p>
        </PortalCard>
        <PortalCard title="System">
          <p className="text-xl font-display text-navy">{overallStatus}</p>
          <p className="text-sm text-navy/50 mt-1">{disabledFeatures} features off</p>
        </PortalCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <PortalCard title="System Control">
          <p className="text-sm text-navy/70 mb-4">
            Manage feature toggles, website content, portal JSON settings, health checks, logs, and data.
          </p>
          <Link
            href="/portal/admin/settings"
            className="inline-block bg-navy text-cream px-4 py-2 text-sm uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
          >
            Open System Control →
          </Link>
        </PortalCard>
        <PortalCard title="Quick Actions">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/portal/admin/users" className="text-gold hover:text-navy">All users</Link>
            <Link href="/portal/admin/units" className="text-gold hover:text-navy">Units</Link>
            <Link href="/portal/staff/applications" className="text-gold hover:text-navy">Applications</Link>
            <Link href="/portal/admin/leases" className="text-gold hover:text-navy">Leases</Link>
            <Link href="/portal/admin/audit" className="text-gold hover:text-navy">Audit log</Link>
          </div>
        </PortalCard>
      </div>

      <PortalCard title="Service status">
        <ul className="space-y-2 text-sm">
          {statusChecks.map((check) => (
            <li key={check.id} className="flex justify-between gap-4 border-b border-navy/5 pb-2 last:border-0">
              <span className="text-navy">{check.label}</span>
              <span
                className={
                  check.status === "ok"
                    ? "text-green-700"
                    : check.status === "warn"
                      ? "text-yellow-700"
                      : "text-red-700"
                }
              >
                {check.status}
              </span>
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
