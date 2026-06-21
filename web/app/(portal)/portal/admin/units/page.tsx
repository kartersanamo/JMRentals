import { ActionForm } from "@/components/portal/ActionForm";
import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { upsertUnit } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function AdminUnitsPage() {
  const units = await db.unit.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PortalPageHeader title="Units" />
      <PortalCard title="Add Unit" className="mb-8">
        <ActionForm action={upsertUnit} successMessage="Unit saved." className="grid sm:grid-cols-2 gap-4">
          <input name="name" required placeholder="Unit name" className="border border-navy/20 px-4 py-3 bg-white" />
          <input name="beds" required placeholder="Beds" className="border border-navy/20 px-4 py-3 bg-white" />
          <input name="baths" required placeholder="Baths" className="border border-navy/20 px-4 py-3 bg-white" />
          <input name="monthlyRent" type="number" step="0.01" required placeholder="Monthly rent" className="border border-navy/20 px-4 py-3 bg-white" />
          <select name="status" defaultValue="AVAILABLE" className="border border-navy/20 px-4 py-3 bg-white">
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <input name="address" placeholder="Address" className="border border-navy/20 px-4 py-3 bg-white" />
          <textarea name="description" rows={3} required placeholder="Description" className="border border-navy/20 px-4 py-3 bg-white sm:col-span-2 resize-y" />
        </ActionForm>
      </PortalCard>
      <PortalCard title="All Units">
        <ul className="space-y-4">
          {units.map((u) => (
            <li key={u.id} className="border border-navy/10 p-4">
              <div className="flex justify-between mb-2">
                <p className="font-medium text-navy">{u.name}</p>
                <StatusBadge status={u.status} />
              </div>
              <p className="text-sm text-navy/70">{u.beds} · {u.baths} · ${Number(u.monthlyRent)}/mo</p>
              <ActionForm action={upsertUnit} successMessage="Unit updated." className="mt-3 grid sm:grid-cols-2 gap-2">
                <input type="hidden" name="id" value={u.id} />
                <input name="name" defaultValue={u.name} className="border border-navy/20 px-3 py-2 text-sm bg-white" />
                <select name="status" defaultValue={u.status} className="border border-navy/20 px-3 py-2 text-sm bg-white">
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                <input name="beds" defaultValue={u.beds} className="border border-navy/20 px-3 py-2 text-sm bg-white" />
                <input name="baths" defaultValue={u.baths} className="border border-navy/20 px-3 py-2 text-sm bg-white" />
                <input name="monthlyRent" type="number" step="0.01" defaultValue={Number(u.monthlyRent)} className="border border-navy/20 px-3 py-2 text-sm bg-white" />
                <input name="address" defaultValue={u.address ?? ""} className="border border-navy/20 px-3 py-2 text-sm bg-white" />
                <textarea name="description" rows={2} defaultValue={u.description} className="border border-navy/20 px-3 py-2 text-sm bg-white sm:col-span-2" />
              </ActionForm>
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
