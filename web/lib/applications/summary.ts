import { getEmploymentDisplayText } from "@/lib/employment";

type ApplicationSummarySource = {
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  desiredUnit?: { name: string } | null;
  moveInDate?: Date | null;
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
