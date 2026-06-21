import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { submitApplication } from "@/lib/actions/portal";
import { db } from "@/lib/db";

export default async function GuestApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit: unitId } = await searchParams;
  const units = await db.unit.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PortalPageHeader
        title="Rental Application"
        subtitle="Tell us about yourself and your preferred move-in date."
      />
      <PortalCard>
        <ActionForm action={submitApplication} successMessage="Application submitted! We'll be in touch soon.">
          <div>
            <label className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Preferred Unit
            </label>
            <select
              name="desiredUnitId"
              defaultValue={unitId ?? ""}
              className="w-full border border-navy/20 px-4 py-3 text-navy bg-white"
            >
              <option value="">No preference</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — ${Number(u.monthlyRent)}/mo
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Desired Move-In Date
            </label>
            <input
              type="date"
              name="moveInDate"
              className="w-full border border-navy/20 px-4 py-3 text-navy bg-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Employment & Income *
            </label>
            <textarea
              name="employmentInfo"
              rows={4}
              required
              className="w-full border border-navy/20 px-4 py-3 text-navy bg-white resize-y"
              placeholder="Employer, position, monthly income, length of employment…"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              rows={3}
              className="w-full border border-navy/20 px-4 py-3 text-navy bg-white resize-y"
            />
          </div>
        </ActionForm>
      </PortalCard>
    </div>
  );
}
