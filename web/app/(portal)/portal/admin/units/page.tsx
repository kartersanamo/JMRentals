import { ActionForm } from "@/components/portal/ActionForm";
import { UnitImageUrlField } from "@/components/admin/UnitImageUrlField";
import {
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { upsertUnit } from "@/lib/actions/portal";
import { db } from "@/lib/db";
import { getSiteContent } from "@/lib/settings/store";
import { getUnitImageAlt, getUnitImageUrl } from "@/lib/unit-images";
import type { SiteGalleryImage } from "@/lib/settings/types";
import type { Unit } from "@prisma/client";
import Image from "next/image";

const fieldClass = "border border-navy/20 px-4 py-3 bg-white w-full";
const fieldClassSm = "border border-navy/20 px-3 py-2 text-sm bg-white w-full";

function UnitField({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function UnitFormFields({
  unit,
  idPrefix,
  galleryImages,
  compact = false,
}: {
  unit?: Unit;
  idPrefix: string;
  galleryImages: SiteGalleryImage[];
  compact?: boolean;
}) {
  const fc = compact ? fieldClassSm : fieldClass;

  return (
    <>
      <UnitField label="Unit name" htmlFor={`${idPrefix}-name`}>
        <input
          id={`${idPrefix}-name`}
          name="name"
          required
          defaultValue={unit?.name}
          placeholder="e.g. One Bedroom Classic"
          className={fc}
        />
      </UnitField>
      <UnitField label="Availability status" htmlFor={`${idPrefix}-status`}>
        <select
          id={`${idPrefix}-status`}
          name="status"
          defaultValue={unit?.status ?? "AVAILABLE"}
          className={fc}
        >
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </UnitField>
      <UnitField label="Bedrooms" htmlFor={`${idPrefix}-beds`}>
        <input
          id={`${idPrefix}-beds`}
          name="beds"
          required
          defaultValue={unit?.beds}
          placeholder="e.g. 1 Bed or Studio"
          className={fc}
        />
      </UnitField>
      <UnitField label="Bathrooms" htmlFor={`${idPrefix}-baths`}>
        <input
          id={`${idPrefix}-baths`}
          name="baths"
          required
          defaultValue={unit?.baths}
          placeholder="e.g. 1 Bath"
          className={fc}
        />
      </UnitField>
      <UnitField label="Monthly rent (USD)" htmlFor={`${idPrefix}-rent`}>
        <input
          id={`${idPrefix}-rent`}
          name="monthlyRent"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={unit ? Number(unit.monthlyRent) : undefined}
          placeholder="e.g. 1050"
          className={fc}
        />
      </UnitField>
      <UnitField label="Property address" htmlFor={`${idPrefix}-address`}>
        <input
          id={`${idPrefix}-address`}
          name="address"
          defaultValue={unit?.address ?? ""}
          placeholder="Street, city, state, zip"
          className={fc}
        />
      </UnitField>
      <UnitImageUrlField
        idPrefix={idPrefix}
        defaultValue={unit?.imageUrl ?? ""}
        galleryImages={galleryImages}
        compact={compact}
      />
      <UnitField
        label="Description"
        htmlFor={`${idPrefix}-description`}
        className="sm:col-span-2"
      >
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={compact ? 2 : 3}
          required
          defaultValue={unit?.description}
          placeholder="Short summary shown to guests browsing units"
          className={`${fc} resize-y`}
        />
      </UnitField>
    </>
  );
}

export default async function AdminUnitsPage() {
  const [units, siteContent] = await Promise.all([
    db.unit.findMany({ orderBy: { name: "asc" } }),
    getSiteContent(),
  ]);
  const galleryImages = siteContent.gallery;

  return (
    <div>
      <PortalPageHeader title="Units" />
      <PortalCard title="Add Unit" className="mb-8">
        <ActionForm
          action={upsertUnit}
          successMessage="Unit saved."
          submitLabel="Add unit"
          className="grid sm:grid-cols-2 gap-4"
        >
          <UnitFormFields idPrefix="new" galleryImages={galleryImages} />
        </ActionForm>
      </PortalCard>
      <PortalCard title="All Units">
        <ul className="space-y-6">
          {units.map((u) => (
            <li key={u.id} className="border border-navy/10 p-4">
              <div className="flex gap-4 mb-4">
                <div className="relative w-28 h-20 shrink-0 bg-navy/5 overflow-hidden">
                  <Image
                    src={getUnitImageUrl(u.imageUrl, u.name)}
                    alt={getUnitImageAlt(u.name)}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <p className="font-medium text-navy">{u.name}</p>
                    <StatusBadge status={u.status} />
                  </div>
                  <p className="text-sm text-navy/70">
                    {u.beds} · {u.baths} · ${Number(u.monthlyRent)}/mo
                  </p>
                </div>
              </div>
              <ActionForm
                action={upsertUnit}
                successMessage="Unit updated."
                submitLabel="Save changes"
                className="grid sm:grid-cols-2 gap-4"
              >
                <input type="hidden" name="id" value={u.id} />
                <UnitFormFields
                  idPrefix={u.id}
                  unit={u}
                  galleryImages={galleryImages}
                  compact
                />
              </ActionForm>
            </li>
          ))}
        </ul>
      </PortalCard>
    </div>
  );
}
