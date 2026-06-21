import { getEmploymentDisplayText } from "@/lib/employment";
import type { EmploymentDetails } from "@/lib/validators/portal";

export function EmploymentSummary({
  employmentDetails,
  employmentInfo,
}: {
  employmentDetails: unknown;
  employmentInfo?: string | null;
}) {
  const parsed = employmentDetails as EmploymentDetails | null;
  const hasStructured =
    parsed &&
    typeof parsed === "object" &&
    "currentEmployer" in parsed &&
    parsed.currentEmployer;

  if (hasStructured) {
    return (
      <div className="text-sm text-navy/80 space-y-4 mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">
            Current Employment
          </p>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <dt className="text-navy/50">Employer</dt>
              <dd>{parsed.currentEmployer}</dd>
            </div>
            <div>
              <dt className="text-navy/50">Position</dt>
              <dd>{parsed.currentPosition}</dd>
            </div>
            <div>
              <dt className="text-navy/50">Started</dt>
              <dd>{parsed.employmentStartDate}</dd>
            </div>
            <div>
              <dt className="text-navy/50">Yearly income</dt>
              <dd>${parsed.yearlyIncome.toLocaleString()}</dd>
            </div>
            {parsed.employerPhone && (
              <div>
                <dt className="text-navy/50">Employer phone</dt>
                <dd>{parsed.employerPhone}</dd>
              </div>
            )}
            {parsed.supervisorName && (
              <div>
                <dt className="text-navy/50">Supervisor</dt>
                <dd>{parsed.supervisorName}</dd>
              </div>
            )}
          </dl>
        </div>

        {parsed.previousJobs.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">
              Previous Employment
            </p>
            <ul className="space-y-3">
              {parsed.previousJobs.map((job, index) => (
                <li key={index} className="border-l-2 border-gold/40 pl-3">
                  <p className="font-medium text-navy">
                    {job.position} at {job.employer}
                  </p>
                  <p className="text-navy/60">
                    {job.startDate} – {job.endDate}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-navy/80 whitespace-pre-wrap mb-3">
      {getEmploymentDisplayText(employmentDetails, employmentInfo)}
    </p>
  );
}
