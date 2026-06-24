import { describe, expect, it } from "vitest";
import {
  collectBlockedMonthsForUnit,
  isDateInBlockedMonth,
  toMonthKey,
} from "@/lib/availability/unit-availability";

describe("unit availability", () => {
  it("blocks months with active leases", () => {
    const unitId = "unit-1";
    const blocked = collectBlockedMonthsForUnit(
      unitId,
      [
        {
          unitId,
          startDate: new Date("2026-03-15T00:00:00.000Z"),
          status: "ACTIVE",
        },
      ],
      []
    );

    expect(blocked.has("2026-03")).toBe(true);
    expect(
      isDateInBlockedMonth(new Date("2026-03-20T00:00:00.000Z"), blocked)
    ).toBe(true);
    expect(toMonthKey(new Date("2026-04-01T00:00:00.000Z"))).toBe("2026-04");
  });
});
