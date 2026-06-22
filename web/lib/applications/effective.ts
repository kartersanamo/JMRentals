import type { Application, Unit } from "@prisma/client";

export type ApplicationWithUnits = Application & {
  desiredUnit: Pick<Unit, "id" | "name" | "monthlyRent" | "status"> | null;
  proposedUnit?: Pick<Unit, "id" | "name" | "monthlyRent" | "status"> | null;
};

export function getEffectiveApplicationTerms(application: ApplicationWithUnits) {
  const useProposal = application.proposalStatus === "CONFIRMED";

  const unitId = useProposal
    ? application.proposedUnitId
    : application.desiredUnitId;
  const unit = useProposal ? application.proposedUnit : application.desiredUnit;
  const moveInDate = useProposal
    ? application.proposedMoveInDate
    : application.moveInDate;
  const rentTerm = useProposal
    ? application.proposedRentTerm ?? application.rentTerm
    : application.rentTerm;
  const monthlyRent = useProposal
    ? application.proposedMonthlyRent != null
      ? Number(application.proposedMonthlyRent)
      : unit
        ? Number(unit.monthlyRent)
        : null
    : unit
      ? Number(unit.monthlyRent)
      : null;

  return { unitId, unit, moveInDate, rentTerm, monthlyRent, useProposal };
}

export function formatRentTerm(term: string): string {
  return term === "ANNUALLY" ? "Annually" : "Monthly";
}
