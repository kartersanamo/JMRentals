import { db } from "@/lib/db";
import { getMailFromAddress, getMailgunClient } from "@/lib/mailgun";
import type { AuditLogEntry, SystemDataStats, SystemStatusCheck } from "./types";

export async function getSystemStatusChecks(): Promise<SystemStatusCheck[]> {
  const checks: SystemStatusCheck[] = [];

  try {
    await db.$queryRaw`SELECT 1`;
    checks.push({
      id: "database",
      label: "Database",
      status: "ok",
      detail: "MySQL connection successful",
    });
  } catch (error) {
    checks.push({
      id: "database",
      label: "Database",
      status: "error",
      detail:
        error instanceof Error ? error.message : "Unable to connect to MySQL",
    });
  }

  const authSecret = process.env.AUTH_SECRET?.trim();
  checks.push({
    id: "auth",
    label: "Authentication",
    status: authSecret ? "ok" : "error",
    detail: authSecret
      ? "AUTH_SECRET is configured"
      : "AUTH_SECRET is missing — login will fail",
  });

  const mailgun = getMailgunClient();
  const from = getMailFromAddress();
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const apiKey = process.env.MAILGUN_API_KEY?.trim();

  if (mailgun && from && domain && apiKey) {
    checks.push({
      id: "mailgun",
      label: "Mailgun email",
      status: "ok",
      detail: `Configured for ${domain}`,
    });
  } else {
    const missing = [
      !apiKey && "MAILGUN_API_KEY",
      !domain && "MAILGUN_DOMAIN",
      !from && "MAILGUN_FROM",
    ].filter(Boolean);
    checks.push({
      id: "mailgun",
      label: "Mailgun email",
      status: "warn",
      detail:
        missing.length > 0
          ? `Missing: ${missing.join(", ")}`
          : "Mailgun client unavailable",
    });
  }

  const mapbox = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  checks.push({
    id: "mapbox",
    label: "Mapbox maps",
    status: mapbox ? "ok" : "warn",
    detail: mapbox
      ? "Map token configured"
      : "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set — map will be hidden",
  });

  const siteUrl =
    process.env.AUTH_URL?.trim() ?? process.env.NEXT_PUBLIC_SITE_URL?.trim();
  checks.push({
    id: "site_url",
    label: "Public site URL",
    status: siteUrl ? "ok" : "warn",
    detail: siteUrl ?? "Set AUTH_URL or NEXT_PUBLIC_SITE_URL for email links",
  });

  const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (stripeSecret && stripeWebhook && stripePublishable) {
    checks.push({
      id: "stripe",
      label: "Stripe payments",
      status: "ok",
      detail: "Stripe keys configured for online rent payments",
    });
  } else {
    const missing = [
      !stripeSecret && "STRIPE_SECRET_KEY",
      !stripeWebhook && "STRIPE_WEBHOOK_SECRET",
      !stripePublishable && "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ].filter(Boolean);
    checks.push({
      id: "stripe",
      label: "Stripe payments",
      status: "warn",
      detail:
        missing.length > 0
          ? `Missing: ${missing.join(", ")}`
          : "Stripe not fully configured",
    });
  }

  return checks;
}

export async function getSystemDataStats(): Promise<SystemDataStats> {
  const [
    users,
    guests,
    residents,
    staff,
    admins,
    units,
    availableUnits,
    applications,
    pendingApplications,
    maintenanceOpen,
    leases,
    messages,
    announcements,
    auditEvents,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "GUEST" } }),
    db.user.count({ where: { role: "RESIDENT" } }),
    db.user.count({ where: { role: "STAFF" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.unit.count(),
    db.unit.count({ where: { status: "AVAILABLE" } }),
    db.application.count(),
    db.application.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    db.maintenanceRequest.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    db.lease.count(),
    db.message.count(),
    db.announcement.count(),
    db.auditLog.count(),
  ]);

  return {
    users,
    guests,
    residents,
    staff,
    admins,
    units,
    availableUnits,
    applications,
    pendingApplications,
    maintenanceOpen,
    leases,
    messages,
    announcements,
    auditEvents,
  };
}

export async function getRecentAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
    actorName: `${log.actor.firstName} ${log.actor.lastName}`,
    actorEmail: log.actor.email,
  }));
}
