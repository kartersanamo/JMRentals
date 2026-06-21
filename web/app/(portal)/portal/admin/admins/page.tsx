import { CreateUserForm } from "@/components/portal/CreateUserForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { db } from "@/lib/db";

export default async function AdminAdminsPage() {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PortalPageHeader title="Administrators" subtitle="Create and manage admin accounts." />
      <PortalCard title="Create Admin" className="mb-8">
        <CreateUserForm role="ADMIN" />
      </PortalCard>
      <PortalCard title="Current Admins">
        {admins.length === 0 ? (
          <EmptyState message="No admins seeded. Run db:seed with ADMIN_SEED_EMAILS." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {admins.map((a) => (
              <li key={a.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-navy">{a.firstName} {a.lastName}</p>
                  <p className="text-sm text-navy/60">{a.email}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
