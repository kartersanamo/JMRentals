import { SignLeaseForm } from "@/components/portal/SignLeaseForm";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
  StatusBadge,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { documentCategoryLabel } from "@/lib/documents/access";
import { getResidentLease } from "@/lib/portal-queries";
import { isFeatureEnabled } from "@/lib/settings/store";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ResidentLeasePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [lease, leaseSigningEnabled] = await Promise.all([
    getResidentLease(session.user.id),
    isFeatureEnabled("leaseSigning"),
  ]);

  return (
    <div>
      <PortalPageHeader
        title="My Lease"
        subtitle="Review your lease details, download documents, and sign when ready."
      />
      <PortalCard>
        {!lease ? (
          <EmptyState message="No lease found. Contact the office if this is incorrect." />
        ) : (
          <div className="space-y-8">
            {lease.status === "PENDING" && !leaseSigningEnabled && (
              <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                Your lease is pending. Online signing is temporarily unavailable — please
                contact the office to complete your lease.
              </div>
            )}
            {lease.status === "PENDING" && leaseSigningEnabled && (
              <div className="bg-gold/10 border border-gold/30 p-4">
                <p className="font-medium text-navy">Signature required</p>
                <p className="text-sm text-navy/70 mt-1">
                  Your lease is ready for review. Download the lease packet below, then sign
                  electronically to activate your lease.
                </p>
              </div>
            )}
            {lease.status === "ACTIVE" && lease.signedAt && (
              <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-900">
                Signed by {lease.signedByName} on {lease.signedAt.toLocaleString()}
              </div>
            )}
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Unit</dt>
                <dd className="text-navy font-medium mt-1">{lease.unit.name}</dd>
              </div>
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={lease.status} />
                </dd>
              </div>
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Start Date</dt>
                <dd className="text-navy mt-1">{lease.startDate.toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">End Date</dt>
                <dd className="text-navy mt-1">
                  {lease.endDate ? lease.endDate.toLocaleDateString() : "Month-to-month"}
                </dd>
              </div>
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Monthly Rent</dt>
                <dd className="text-navy font-display text-xl mt-1">
                  ${Number(lease.monthlyRent).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-navy/50 uppercase text-xs tracking-wider">Layout</dt>
                <dd className="text-navy mt-1">
                  {lease.unit.beds} · {lease.unit.baths}
                </dd>
              </div>
              {lease.unit.address && (
                <div className="sm:col-span-2">
                  <dt className="text-navy/50 uppercase text-xs tracking-wider">Address</dt>
                  <dd className="text-navy mt-1">{lease.unit.address}</dd>
                </div>
              )}
              {lease.houseRules && (
                <div className="sm:col-span-2">
                  <dt className="text-navy/50 uppercase text-xs tracking-wider">House Rules</dt>
                  <dd className="text-navy/80 mt-1 whitespace-pre-wrap">{lease.houseRules}</dd>
                </div>
              )}
            </dl>

            {(lease.leaseDocument || lease.documents.length > 0) && (
              <div>
                <h3 className="font-display text-lg text-navy mb-3">Lease Documents</h3>
                <ul className="space-y-2">
                  {lease.leaseDocument && (
                    <li className="flex items-center justify-between border border-navy/10 px-4 py-3">
                      <div>
                        <p className="font-medium text-navy">{lease.leaseDocument.title}</p>
                        <p className="text-xs text-navy/50">
                          Primary lease agreement · {lease.leaseDocument.fileName}
                        </p>
                      </div>
                      <a
                        href={`/api/documents/${lease.leaseDocument.id}/download`}
                        className="text-sm text-gold hover:text-navy"
                      >
                        Download
                      </a>
                    </li>
                  )}
                  {lease.documents
                    .filter((doc) => doc.id !== lease.leaseDocumentId)
                    .map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between border border-navy/10 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-navy">{doc.title}</p>
                          <p className="text-xs text-navy/50">
                            {documentCategoryLabel(doc.category)} · {doc.fileName}
                          </p>
                        </div>
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          className="text-sm text-gold hover:text-navy"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {lease.status === "PENDING" && leaseSigningEnabled && (
              <div className="border border-navy/10 p-5">
                <h3 className="font-display text-lg text-navy mb-4">Sign Your Lease</h3>
                <SignLeaseForm
                  leaseId={lease.id}
                  residentName={session.user.name ?? ""}
                />
              </div>
            )}

            <p className="text-sm text-navy/60">
              All property documents are also available on your{" "}
              <Link href="/portal/resident/documents" className="text-gold hover:text-navy">
                Documents page
              </Link>
              .
            </p>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
