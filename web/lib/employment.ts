import type { EmploymentDetails } from "@/lib/validators/portal";

export function formatEmploymentDetails(details: EmploymentDetails): string {
  const lines: string[] = [
    "Current Employment",
    `Employer: ${details.currentEmployer}`,
    `Position: ${details.currentPosition}`,
    `Started: ${details.employmentStartDate}`,
    `Yearly income: $${details.yearlyIncome.toLocaleString()}`,
  ];

  if (details.employerPhone) {
    lines.push(`Employer phone: ${details.employerPhone}`);
  }
  if (details.supervisorName) {
    lines.push(`Supervisor: ${details.supervisorName}`);
  }

  if (details.previousJobs.length > 0) {
    lines.push("", "Previous Employment");
    details.previousJobs.forEach((job, index) => {
      lines.push(
        `${index + 1}. ${job.position} at ${job.employer}`,
        `   ${job.startDate} – ${job.endDate}`
      );
    });
  }

  return lines.join("\n");
}

export function parseEmploymentDetails(
  value: unknown
): EmploymentDetails | null {
  if (!value || typeof value !== "object") return null;
  return value as EmploymentDetails;
}

export function getEmploymentDisplayText(
  employmentDetails: unknown,
  legacyText?: string | null
): string {
  const parsed = parseEmploymentDetails(employmentDetails);
  if (parsed) return formatEmploymentDetails(parsed);
  if (legacyText?.trim()) return legacyText;
  return "No employment information provided.";
}
