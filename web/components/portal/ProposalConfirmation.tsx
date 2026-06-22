"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { Button } from "@/components/ui/Button";
import {
  confirmApplicationProposal,
  rejectApplicationProposal,
} from "@/lib/actions/portal";
import { formatRentTerm } from "@/lib/applications/effective";
import Link from "next/link";

type ProposalDetails = {
  id: string;
  proposalNotes: string | null;
  proposedMoveInDate: string | null;
  proposedRentTerm: string;
  proposedMonthlyRent: number | null;
  proposedUnit: { name: string } | null;
  desiredUnit: { name: string } | null;
  moveInDate: string | null;
  rentTerm: string;
};

export function ProposalConfirmation({
  proposal,
  token,
}: {
  proposal: ProposalDetails;
  token: string;
}) {

  return (
    <div>
      <PortalPageHeader
        title="Confirm Lease Terms"
        subtitle="Review the updated lease details from our team before we finalize your application."
      />
      <PortalCard>
        <div className="space-y-4 text-sm text-navy/80">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-navy/10 p-4 bg-sage-light/20">
              <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">
                Your Original Request
              </p>
              <p>Unit: {proposal.desiredUnit?.name ?? "—"}</p>
              <p>
                Move-in:{" "}
                {proposal.moveInDate
                  ? new Date(proposal.moveInDate).toLocaleDateString()
                  : "—"}
              </p>
              <p>Rent: {formatRentTerm(proposal.rentTerm)}</p>
            </div>
            <div className="border border-gold/40 p-4 bg-gold/5">
              <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">
                Proposed Terms
              </p>
              <p>Unit: {proposal.proposedUnit?.name ?? "—"}</p>
              <p>
                Move-in:{" "}
                {proposal.proposedMoveInDate
                  ? new Date(proposal.proposedMoveInDate).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                Rent:{" "}
                {proposal.proposedMonthlyRent != null
                  ? `$${proposal.proposedMonthlyRent.toLocaleString()}`
                  : "—"}{" "}
                ({formatRentTerm(proposal.proposedRentTerm)})
              </p>
            </div>
          </div>

          {proposal.proposalNotes && (
            <p className="bg-sage-light p-3 border border-navy/10">
              <span className="font-medium text-navy">Note from staff: </span>
              {proposal.proposalNotes}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <ActionForm
              action={confirmApplicationProposal}
              successMessage="Thank you — your lease terms are confirmed."
            >
              <input type="hidden" name="token" value={token} />
              <Button type="submit">Confirm Terms</Button>
            </ActionForm>

            <ActionForm
              action={rejectApplicationProposal}
              successMessage="We've recorded your response. Our team will follow up."
            >
              <input type="hidden" name="token" value={token} />
              <Button type="submit" variant="outline">
                Decline
              </Button>
            </ActionForm>

            <Link
              href="/portal/guest/applications"
              className="inline-flex items-center text-sm text-navy/60 hover:text-navy px-3"
            >
              Back to applications
            </Link>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
