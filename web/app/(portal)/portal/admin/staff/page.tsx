import { CreateUserForm } from "@/components/portal/CreateUserForm";
import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { db } from "@/lib/db";

export default async function AdminStaffPage() {
  const staff = await db.user.findMany({
    where: { role: "STAFF" },
    orderBy: { lastName: "asc" },
  });

  return (
    <div>
      <PortalPageHeader title="Staff" subtitle="Create staff accounts for guest management." />
      <PortalCard title="Create Staff" className="mb-8">
        <CreateUserForm role="STAFF" />
      </PortalCard>
      <PortalCard title="Staff Members">
        <ul className="divide-y divide-navy/10">
          {staff.map((s) => (
            <li key={s.id} className="py-3 flex justify-between">
              <div>
                <p className="font-medium text-navy">{s.firstName} {s.lastName}</p>
                <p className="text-sm text-navy/60">{s.email}</p>
              </div>
              <StatusBadge status={s.status} />
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
