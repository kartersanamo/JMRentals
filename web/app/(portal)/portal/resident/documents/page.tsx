import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { documentCategoryLabel } from "@/lib/documents/access";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ResidentDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lease = await db.lease.findFirst({
    where: {
      residentId: session.user.id,
      status: { in: ["PENDING", "ACTIVE"] },
    },
  });

  const documents = await db.document.findMany({
    where: {
      OR: [
        { residentId: session.user.id },
        { isGlobal: true },
        ...(lease ? [{ unitId: lease.unitId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PortalPageHeader
        title="Documents"
        subtitle="Lease paperwork, addenda, receipts, and official property documents."
      />
      <PortalCard>
        {documents.length === 0 ? (
          <EmptyState message="No documents on file yet. Your lease packet will appear here once uploaded by staff." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-navy font-medium">{doc.title}</p>
                  <p className="text-sm text-navy/60 mt-1">
                    {documentCategoryLabel(doc.category)} · {doc.fileName}
                  </p>
                  <p className="text-xs text-navy/50 mt-1">
                    Added {doc.createdAt.toLocaleDateString()}
                    {doc.isGlobal ? " · Property-wide" : ""}
                  </p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="text-sm text-gold hover:text-navy font-medium"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
