import { ActionForm } from "@/components/portal/ActionForm";
import { DocumentUploadForm } from "@/components/portal/DocumentUploadForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { deleteDocument } from "@/lib/actions/billing";
import { documentCategoryLabel } from "@/lib/documents/access";
import { db } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/settings/store";

export async function DocumentsManagerPage() {
  const documentsEnabled = await isFeatureEnabled("documentManagement");

  const [documents, residents, units, leases] = await Promise.all([
    db.document.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        resident: { select: { firstName: true, lastName: true } },
        unit: { select: { name: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    }),
    db.user.findMany({
      where: { role: "RESIDENT" },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    db.unit.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.lease.findMany({
      where: { status: { in: ["PENDING", "ACTIVE"] } },
      include: {
        resident: { select: { firstName: true, lastName: true } },
        unit: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PortalPageHeader
        title="Documents"
        subtitle="Upload lease packets, addenda, receipts, and property documents."
      />
      <PortalCard title="Upload Document" className="mb-8">
        {documentsEnabled ? (
          <DocumentUploadForm
            residents={residents.map((resident) => ({
              id: resident.id,
              label: `${resident.firstName} ${resident.lastName}`,
            }))}
            units={units.map((unit) => ({ id: unit.id, label: unit.name }))}
            leases={leases.map((lease) => ({
              id: lease.id,
              label: `${lease.resident.firstName} ${lease.resident.lastName} — ${lease.unit.name}`,
            }))}
          />
        ) : (
          <EmptyState message="Document uploads are disabled in System Control." />
        )}
      </PortalCard>
      <PortalCard title="All Documents">
        {documents.length === 0 ? (
          <EmptyState message="No documents uploaded yet." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {documents.map((doc) => (
              <li key={doc.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-navy">{doc.title}</p>
                  <p className="text-sm text-navy/60 mt-1">
                    {documentCategoryLabel(doc.category)} · {doc.fileName} ·{" "}
                    {doc.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-navy/50 mt-1">
                    {doc.isGlobal && "Global · "}
                    {doc.resident
                      ? `Resident: ${doc.resident.firstName} ${doc.resident.lastName} · `
                      : ""}
                    {doc.unit ? `Unit: ${doc.unit.name} · ` : ""}
                    {doc.uploadedBy
                      ? `Uploaded by ${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`
                      : "Uploaded by staff"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    className="text-sm text-gold hover:text-navy"
                  >
                    Download
                  </a>
                  <ActionForm action={deleteDocument} submitLabel="Delete" compact>
                    <input type="hidden" name="id" value={doc.id} />
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
