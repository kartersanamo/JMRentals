import { EmptyState, PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ResidentDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lease = await db.lease.findFirst({
    where: { residentId: session.user.id, status: "ACTIVE" },
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
      <PortalPageHeader title="Documents" subtitle="Lease paperwork, addenda, and house rules." />
      <PortalCard>
        {documents.length === 0 ? (
          <EmptyState message="No documents on file yet. Your lease packet will appear here once uploaded by staff." />
        ) : (
          <ul className="divide-y divide-navy/10">
            {documents.map((doc) => (
              <li key={doc.id} className="py-3 flex justify-between items-center">
                <span className="text-navy font-medium">{doc.title}</span>
                <span className="text-xs text-navy/50">{doc.createdAt.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
