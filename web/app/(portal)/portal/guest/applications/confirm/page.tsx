import { ProposalConfirmation } from "@/components/portal/ProposalConfirmation";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ConfirmProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { token } = await searchParams;
  if (!token) {
    return (
      <div>
        <PortalPageHeader title="Confirm Lease Terms" />
        <PortalCard>
          <p className="text-sm text-navy/70">
            This confirmation link is invalid. Check your email for the latest
            link from our team.
          </p>
          <Link
            href="/portal/guest/applications"
            className="inline-block mt-4 text-gold hover:text-navy"
          >
            View my applications
          </Link>
        </PortalCard>
      </div>
    );
  }

  const application = await db.application.findFirst({
    where: {
      proposalToken: token,
      guestId: session.user.id,
      proposalStatus: "PENDING",
    },
    include: {
      desiredUnit: { select: { name: true } },
      proposedUnit: { select: { name: true } },
    },
  });

  if (!application) {
    return (
      <div>
        <PortalPageHeader title="Confirm Lease Terms" />
        <PortalCard>
          <p className="text-sm text-navy/70">
            This confirmation request was not found, may have expired, or was
            already handled.
          </p>
          <Link
            href="/portal/guest/applications"
            className="inline-block mt-4 text-gold hover:text-navy"
          >
            View my applications
          </Link>
        </PortalCard>
      </div>
    );
  }

  return (
    <ProposalConfirmation
      token={token}
      proposal={{
        id: application.id,
        proposalNotes: application.proposalNotes,
        proposedMoveInDate: application.proposedMoveInDate?.toISOString() ?? null,
        proposedRentTerm: application.proposedRentTerm ?? "MONTHLY",
        proposedMonthlyRent:
          application.proposedMonthlyRent != null
            ? Number(application.proposedMonthlyRent)
            : null,
        proposedUnit: application.proposedUnit,
        desiredUnit: application.desiredUnit,
        moveInDate: application.moveInDate?.toISOString() ?? null,
        rentTerm: application.rentTerm,
      }}
    />
  );
}
