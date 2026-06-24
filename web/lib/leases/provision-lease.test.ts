import { describe, expect, it } from "vitest";
import { validateApplicationForAutoLease } from "@/lib/leases/provision-lease";

describe("validateApplicationForAutoLease", () => {
  it("rejects applications without a unit", () => {
    const result = validateApplicationForAutoLease({
      guest: { id: "guest-1" },
      desiredUnitId: null,
      proposedUnitId: null,
      moveInDate: new Date("2026-06-01"),
      proposedMoveInDate: null,
      rentTerm: "MONTHLY",
      proposedRentTerm: null,
      proposedMonthlyRent: null,
      proposalStatus: null,
      desiredUnit: null,
      proposedUnit: null,
    } as never);

    expect(result).toEqual({
      error:
        "Cannot approve automatically: this application has no unit selected. Assign a lease manually from Residents or Leases & Billing.",
    });
  });

  it("accepts available units with move-in and rent", () => {
    const unit = {
      id: "unit-1",
      name: "Studio Retreat",
      status: "AVAILABLE",
      monthlyRent: 850,
    };

    const result = validateApplicationForAutoLease({
      guest: { id: "guest-1" },
      desiredUnitId: unit.id,
      proposedUnitId: null,
      moveInDate: new Date("2026-06-01"),
      proposedMoveInDate: null,
      rentTerm: "MONTHLY",
      proposedRentTerm: null,
      proposedMonthlyRent: null,
      proposalStatus: null,
      desiredUnit: unit,
      proposedUnit: null,
    } as never);

    expect(result).toEqual({ unit });
  });
});
