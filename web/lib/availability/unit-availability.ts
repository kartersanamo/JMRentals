import { db } from "@/lib/db";
import type { Application, Lease } from "@prisma/client";

export type MonthKey = `${number}-${string}`;

export function toMonthKey(date: Date): MonthKey {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthKeyFromIso(iso: string): MonthKey {
  const [year, month] = iso.split("-");
  return `${year}-${month}` as MonthKey;
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

export function isDateInBlockedMonth(date: Date, blockedMonths: Set<MonthKey>): boolean {
  return blockedMonths.has(toMonthKey(date));
}

function addBlockedMonth(months: Set<MonthKey>, date: Date | null | undefined) {
  if (!date) return;
  months.add(toMonthKey(date));
}

export function collectBlockedMonthsForUnit(
  unitId: string,
  leases: Pick<Lease, "unitId" | "startDate" | "status">[],
  applications: Pick<
    Application,
    | "desiredUnitId"
    | "proposedUnitId"
    | "moveInDate"
    | "proposedMoveInDate"
    | "status"
    | "proposalStatus"
  >[]
): Set<MonthKey> {
  const blocked = new Set<MonthKey>();

  for (const lease of leases) {
    if (lease.unitId !== unitId) continue;
    if (lease.status !== "PENDING" && lease.status !== "ACTIVE") continue;
    addBlockedMonth(blocked, lease.startDate);
  }

  for (const application of applications) {
    if (application.status === "APPROVED" && application.desiredUnitId === unitId) {
      addBlockedMonth(blocked, application.moveInDate);
    }

    if (
      application.proposalStatus === "CONFIRMED" &&
      application.proposedUnitId === unitId
    ) {
      addBlockedMonth(blocked, application.proposedMoveInDate);
    }
  }

  return blocked;
}

export async function getUnitAvailabilityMaps(excludeApplicationId?: string) {
  const [units, leases, applications] = await Promise.all([
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.lease.findMany({
      where: { status: { in: ["PENDING", "ACTIVE"] } },
      select: { unitId: true, startDate: true, status: true },
    }),
    db.application.findMany({
      where: {
        ...(excludeApplicationId ? { id: { not: excludeApplicationId } } : {}),
        OR: [
          { status: "APPROVED" },
          { proposalStatus: "CONFIRMED" },
        ],
      },
      select: {
        id: true,
        desiredUnitId: true,
        proposedUnitId: true,
        moveInDate: true,
        proposedMoveInDate: true,
        status: true,
        proposalStatus: true,
      },
    }),
  ]);

  const byUnit: Record<string, MonthKey[]> = {};
  const allBlocked = new Set<MonthKey>();

  for (const unit of units) {
    const months = collectBlockedMonthsForUnit(unit.id, leases, applications);
    byUnit[unit.id] = Array.from(months).sort();
    for (const month of months) {
      allBlocked.add(month);
    }
  }

  return {
    units: units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      blockedMonths: byUnit[unit.id] ?? [],
    })),
    allBlockedMonths: Array.from(allBlocked).sort(),
  };
}

export function isMoveInDateAvailable(
  moveInDate: Date,
  unitId: string | null | undefined,
  availability: Awaited<ReturnType<typeof getUnitAvailabilityMaps>>
): boolean {
  if (!unitId) return true;

  const unit = availability.units.find((entry) => entry.id === unitId);
  if (!unit) return false;

  const blocked = new Set(unit.blockedMonths as MonthKey[]);
  return !isDateInBlockedMonth(moveInDate, blocked);
}
