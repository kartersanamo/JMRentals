"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { ImageUrlPicker } from "@/components/admin/ImageUrlPicker";
import {
  resetSiteContentDefaults,
  resetSystemConfigDefaults,
  updatePortalSettingJson,
  updateSiteContentFields,
  updateSiteLists,
  updateSystemFeatures,
} from "@/lib/actions/admin-settings";
import {
  FEATURE_DEFINITIONS,
  MARKETING_DEFINITIONS,
} from "@/lib/settings/defaults";
import type {
  AuditLogEntry,
  SiteContent,
  SystemConfig,
  SystemDataStats,
  SystemStatusCheck,
} from "@/lib/settings/types";
import { useState } from "react";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features & Display" },
  { id: "website", label: "Website Content" },
  { id: "portal", label: "Portal Content" },
  { id: "activity", label: "Activity Log" },
  { id: "data", label: "Data" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass =
  "w-full border border-navy/20 px-4 py-3 text-navy bg-white focus:outline-none focus:border-gold";
const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";

function StatusBadge({ status }: { status: SystemStatusCheck["status"] }) {
  const styles = {
    ok: "bg-green-100 text-green-800",
    warn: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

function ToggleRow({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-4 border border-navy/10 p-4 cursor-pointer hover:bg-sage-light/30"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 accent-gold"
      />
      <span>
        <span className="block font-medium text-navy">{label}</span>
        <span className="block text-sm text-navy/60 mt-1">{description}</span>
      </span>
    </label>
  );
}

export function AdminCommandCenter({
  systemConfig,
  siteContent,
  statusChecks,
  stats,
  auditLogs,
  homeInfoJson,
  checklistJson,
}: {
  systemConfig: SystemConfig;
  siteContent: SiteContent;
  statusChecks: SystemStatusCheck[];
  stats: SystemDataStats;
  auditLogs: AuditLogEntry[];
  homeInfoJson: string;
  checklistJson: string;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  const overallStatus = statusChecks.some((c) => c.status === "error")
    ? "error"
    : statusChecks.some((c) => c.status === "warn")
      ? "warn"
      : "ok";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 border-b border-navy/10 pb-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
              tab === item.id
                ? "bg-navy text-cream"
                : "bg-white text-navy/70 border border-navy/10 hover:border-gold"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-8">
          <section className="grid md:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.users} />
            <StatCard label="Pending applications" value={stats.pendingApplications} />
            <StatCard label="Open maintenance" value={stats.maintenanceOpen} />
            <StatCard label="Available units" value={stats.availableUnits} />
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-2xl text-navy">System Status</h2>
              <StatusBadge status={overallStatus} />
            </div>
            <ul className="space-y-3">
              {statusChecks.map((check) => (
                <li
                  key={check.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/5 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-navy">{check.label}</p>
                    <p className="text-sm text-navy/60">{check.detail}</p>
                  </div>
                  <StatusBadge status={check.status} />
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-4">Quick links</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <QuickLink href="/portal/admin/users" label="All users" />
              <QuickLink href="/portal/admin/units" label="Units" />
              <QuickLink href="/portal/staff/applications" label="Applications" />
              <QuickLink href="/portal/staff/maintenance" label="Maintenance" />
              <QuickLink href="/portal/admin/audit" label="Full audit log" />
              <QuickLink href="/" label="View public website" />
            </div>
          </section>
        </div>
      )}

      {tab === "features" && (
        <div className="space-y-8">
          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-2">Feature toggles</h2>
            <p className="text-sm text-navy/60 mb-6">
              Enable or disable major website and portal capabilities.
            </p>
            <ActionForm
              action={updateSystemFeatures}
              successMessage="Feature settings saved."
              submitLabel="Save feature toggles"
              className="space-y-6"
            >
              {(["website", "portal", "system"] as const).map((group) => (
                <div key={group}>
                  <h3 className="text-xs uppercase tracking-widest text-gold mb-3">
                    {group}
                  </h3>
                  <div className="space-y-2">
                    {FEATURE_DEFINITIONS.filter((f) => f.group === group).map(
                      (feature) => (
                        <ToggleRow
                          key={feature.key}
                          id={`feature-${feature.key}`}
                          name={`feature_${feature.key}`}
                          label={feature.label}
                          description={feature.description}
                          defaultChecked={systemConfig.features[feature.key]}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}
            </ActionForm>
            <ActionForm
              action={resetSystemConfigDefaults}
              successMessage="Feature toggles reset to defaults."
              submitLabel="Reset toggles to defaults"
              className="mt-4"
            >
              <span className="sr-only">Reset</span>
            </ActionForm>
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-2">Homepage sections</h2>
            <p className="text-sm text-navy/60 mb-6">
              Control which blocks appear on the public homepage.
            </p>
            <ActionForm
              action={updateSystemFeatures}
              successMessage="Homepage display settings saved."
              submitLabel="Save homepage sections"
              className="space-y-2"
            >
              {Object.entries(systemConfig.features).map(([key, value]) => (
                <input
                  key={`preserve-feature-${key}`}
                  type="hidden"
                  name={`feature_${key}`}
                  value={value ? "on" : "off"}
                />
              ))}
              {MARKETING_DEFINITIONS.map((section) => (
                <ToggleRow
                  key={section.key}
                  id={`marketing-${section.key}`}
                  name={`marketing_${section.key}`}
                  label={section.label}
                  description={section.description}
                  defaultChecked={systemConfig.marketing[section.key]}
                />
              ))}
            </ActionForm>
          </section>
        </div>
      )}

      {tab === "website" && (
        <div className="space-y-8">
          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-6">Business information</h2>
            <ActionForm
              action={updateSiteContentFields}
              successMessage="Website content saved."
              submitLabel="Save business info"
              className="grid sm:grid-cols-2 gap-4"
            >
              <Field label="Business name" name="name" defaultValue={siteContent.name} />
              <Field label="Legal name" name="legalName" defaultValue={siteContent.legalName} />
              <Field label="Tagline" name="tagline" defaultValue={siteContent.tagline} className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" rows={3} defaultValue={siteContent.description} className={fieldClass} />
              </div>
              <Field label="Phone" name="phone" defaultValue={siteContent.phone} />
              <Field label="Email" name="email" type="email" defaultValue={siteContent.email} />
              <Field label="Street" name="street" defaultValue={siteContent.address.street} />
              <Field label="City" name="city" defaultValue={siteContent.address.city} />
              <Field label="State" name="state" defaultValue={siteContent.address.state} />
              <Field label="ZIP" name="zip" defaultValue={siteContent.address.zip} />
              <Field label="Latitude" name="lat" type="number" step="any" defaultValue={String(siteContent.coordinates.lat)} />
              <Field label="Longitude" name="lng" type="number" step="any" defaultValue={String(siteContent.coordinates.lng)} />
              <div className="sm:col-span-2">
                <ImageUrlPicker
                  name="heroImage"
                  label="Hero image"
                  defaultValue={siteContent.heroImage}
                  galleryImages={siteContent.gallery}
                  inputClassName={fieldClass}
                />
              </div>
              <Field label="Facebook URL" name="facebook" defaultValue={siteContent.social.facebook} className="sm:col-span-2" />
              <Field label="Terms last updated" name="termsLastUpdated" defaultValue={siteContent.termsLastUpdated} />
              <Field label="Privacy last updated" name="privacyLastUpdated" defaultValue={siteContent.privacyLastUpdated} />
            </ActionForm>
            <ActionForm
              action={resetSiteContentDefaults}
              successMessage="Website content reset to defaults."
              submitLabel="Reset website content to defaults"
              className="mt-4"
            >
              <span className="sr-only">Reset</span>
            </ActionForm>
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-2">Photo gallery</h2>
            <p className="text-sm text-navy/60 mb-6">
              Manage photos for the public gallery and preset image pickers across the admin site.
            </p>
            <GalleryManager
              initialGallery={siteContent.gallery}
              initialCategories={siteContent.galleryCategories}
            />
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-4">Office hours (JSON)</h2>
            <ActionForm action={updateSiteLists} successMessage="Office hours saved." submitLabel="Save hours">
              <input type="hidden" name="listKey" value="hours" />
              <textarea name="value" rows={10} defaultValue={JSON.stringify(siteContent.hours, null, 2)} className={`${fieldClass} font-mono text-sm`} spellCheck={false} />
            </ActionForm>
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-4">Neighborhood highlights</h2>
            <p className="text-sm text-navy/60 mb-4">One item per line.</p>
            <ActionForm action={updateSiteLists} successMessage="Neighborhood list saved." submitLabel="Save neighborhood">
              <input type="hidden" name="listKey" value="neighborhood" />
              <textarea name="value" rows={8} defaultValue={siteContent.neighborhood.join("\n")} className={fieldClass} />
            </ActionForm>
          </section>
        </div>
      )}

      {tab === "portal" && (
        <div className="space-y-8">
          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-4">Resident home info (JSON)</h2>
            <ActionForm action={updatePortalSettingJson} successMessage="Home info saved." submitLabel="Save home info">
              <input type="hidden" name="key" value="home_info" />
              <textarea name="value" rows={12} defaultValue={homeInfoJson} className={`${fieldClass} font-mono text-sm`} spellCheck={false} />
            </ActionForm>
          </section>

          <section className="bg-white border border-navy/10 p-6">
            <h2 className="font-display text-2xl text-navy mb-4">Default move-in checklist (JSON)</h2>
            <ActionForm action={updatePortalSettingJson} successMessage="Checklist saved." submitLabel="Save checklist">
              <input type="hidden" name="key" value="default_checklist" />
              <textarea name="value" rows={10} defaultValue={checklistJson} className={`${fieldClass} font-mono text-sm`} spellCheck={false} />
            </ActionForm>
          </section>
        </div>
      )}

      {tab === "activity" && (
        <section className="bg-white border border-navy/10 p-6">
          <h2 className="font-display text-2xl text-navy mb-4">Recent activity</h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-navy/50 py-8 text-center">No audit events yet.</p>
          ) : (
            <ul className="space-y-3 text-sm max-h-[600px] overflow-y-auto">
              {auditLogs.map((log) => (
                <li key={log.id} className="border-b border-navy/10 pb-3">
                  <p className="font-medium text-navy">{log.action}</p>
                  <p className="text-navy/60">
                    {log.actorName} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.details && <p className="text-navy/70 mt-1">{log.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "data" && (
        <section className="bg-white border border-navy/10 p-6">
          <h2 className="font-display text-2xl text-navy mb-6">Database overview</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataRow label="Users" value={stats.users} sub={`${stats.admins} admins · ${stats.staff} staff · ${stats.residents} residents · ${stats.guests} guests`} />
            <DataRow label="Units" value={stats.units} sub={`${stats.availableUnits} available`} />
            <DataRow label="Applications" value={stats.applications} sub={`${stats.pendingApplications} pending review`} />
            <DataRow label="Leases" value={stats.leases} />
            <DataRow label="Maintenance" value={stats.maintenanceOpen} sub="open / in progress" />
            <DataRow label="Messages" value={stats.messages} />
            <DataRow label="Announcements" value={stats.announcements} />
            <DataRow label="Audit events" value={stats.auditEvents} />
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-navy/10 p-5">
      <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">{label}</p>
      <p className="text-3xl font-display text-navy">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="px-3 py-2 border border-navy/10 text-gold hover:text-navy hover:border-gold transition-colors">
      {label}
    </a>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  step?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClass}>{label}</label>
      <input id={name} name={name} type={type} step={step} defaultValue={defaultValue} className={fieldClass} />
    </div>
  );
}

function DataRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="border border-navy/10 p-4">
      <p className="text-xs uppercase tracking-widest text-navy/50">{label}</p>
      <p className="text-2xl font-display text-navy mt-1">{value}</p>
      {sub && <p className="text-sm text-navy/60 mt-1">{sub}</p>}
    </div>
  );
}
