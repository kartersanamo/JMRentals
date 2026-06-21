import { EmptyState, PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { db } from "@/lib/db";

export default async function AdminAuditPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <div>
      <PortalPageHeader title="Audit Log" />
      <PortalCard>
        {logs.length === 0 ? (
          <EmptyState message="No audit events yet." />
        ) : (
          <ul className="space-y-3 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="border-b border-navy/10 pb-3">
                <p className="font-medium text-navy">{log.action}</p>
                <p className="text-navy/60">
                  {log.actor.firstName} {log.actor.lastName} · {log.createdAt.toLocaleString()}
                </p>
                {log.details && <p className="text-navy/70 mt-1">{log.details}</p>}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
