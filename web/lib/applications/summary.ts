import { getEmploymentDisplayText } from "@/lib/employment";
import { formatRentTerm } from "@/lib/applications/effective";

type ApplicationSummarySource = {
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  desiredUnit?: { name: string } | null;
  proposedUnit?: { name: string } | null;
  moveInDate?: Date | null;
  proposedMoveInDate?: Date | null;
  rentTerm?: string;
  proposedRentTerm?: string | null;
  proposedMonthlyRent?: unknown;
  proposalStatus?: string | null;
  additionalNotes?: string | null;
  reviewNotes?: string | null;
  employmentDetails?: unknown;
  employmentInfo?: string | null;
};

export function formatApplicationSummary(
  application: ApplicationSummarySource
): string {
  const employmentText = getEmploymentDisplayText(
    application.employmentDetails,
    application.employmentInfo
  );

  return [
    `Applicant: ${application.guest.firstName} ${application.guest.lastName}`,
    `Email: ${application.guest.email}`,
    application.guest.phone ? `Phone: ${application.guest.phone}` : null,
    `Unit requested: ${application.desiredUnit?.name ?? "No preference"}`,
    application.moveInDate
      ? `Move-in date: ${application.moveInDate.toLocaleDateString()}`
      : null,
    application.rentTerm
      ? `Rent payment: ${formatRentTerm(application.rentTerm)}`
      : null,
    application.proposalStatus === "PENDING" && application.proposedUnit
      ? `Proposed unit: ${application.proposedUnit.name}`
      : null,
    application.proposalStatus === "PENDING" && application.proposedMoveInDate
      ? `Proposed move-in: ${application.proposedMoveInDate.toLocaleDateString()}`
      : null,
    application.proposalStatus === "PENDING" && application.proposedRentTerm
      ? `Proposed rent term: ${formatRentTerm(application.proposedRentTerm)}`
      : null,
    application.proposalStatus === "PENDING" &&
    application.proposedMonthlyRent != null
      ? `Proposed rent: $${Number(application.proposedMonthlyRent).toLocaleString()}`
      : null,
    application.additionalNotes
      ? `Applicant notes: ${application.additionalNotes}`
      : null,
    application.reviewNotes ? `Staff note: ${application.reviewNotes}` : null,
    "",
    employmentText,
  ]
    .filter(Boolean)
    .join("\n");
}
