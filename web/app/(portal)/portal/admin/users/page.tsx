import { ActionForm } from "@/components/portal/ActionForm";
import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { changeUserRole, updateUserStatus } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
  });

  return (
    <div>
      <PortalPageHeader title="All Users" />
      <PortalCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy/50 border-b border-navy/10">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-navy/5 align-top">
                  <td className="py-3 pr-4">{u.firstName} {u.lastName}</td>
                  <td className="py-3 pr-4 text-navy/70">{u.email}</td>
                  <td className="py-3 pr-4">
                    <div className="space-y-2">
                      <StatusBadge status={u.role} />
                      <ActionForm
                        action={changeUserRole}
                        successMessage="Role updated."
                        submitLabel="Update role"
                        compact
                      >
                        <input type="hidden" name="id" value={u.id} />
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="border border-navy/20 px-2 py-1 text-xs bg-white"
                        >
                          <option value="GUEST">GUEST</option>
                          <option value="RESIDENT">RESIDENT</option>
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </ActionForm>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="space-y-2">
                      <StatusBadge status={u.status} />
                      <ActionForm
                        action={updateUserStatus}
                        successMessage="Status updated."
                        submitLabel={u.status === "ACTIVE" ? "Disable" : "Enable"}
                        compact
                      >
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={u.status === "ACTIVE" ? "DISABLED" : "ACTIVE"}
                        />
                      </ActionForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalCard>
    </div>
  );
}
