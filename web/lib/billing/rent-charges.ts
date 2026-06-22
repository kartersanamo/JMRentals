import { db } from "@/lib/db";

export function billingMonthLabel(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const dueDate = new Date(year, month - 1, 1);
  return dueDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function billingMonthDueDate(billingMonth: string): Date {
  const [year, month] = billingMonth.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export async function ensureMonthlyRentCharges(
  billingMonth: string
): Promise<number> {
  const monthLabel = billingMonthLabel(billingMonth);
  const dueDate = billingMonthDueDate(billingMonth);

  const leases = await db.lease.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, residentId: true, monthlyRent: true },
  });

  let created = 0;
  for (const lease of leases) {
    const description = `${monthLabel} Rent`;
    const existing = await db.paymentRecord.findFirst({
      where: {
        residentId: lease.residentId,
        leaseId: lease.id,
        description,
      },
    });
    if (existing) continue;

    await db.paymentRecord.create({
      data: {
        residentId: lease.residentId,
        leaseId: lease.id,
        amount: lease.monthlyRent,
        dueDate,
        description,
      },
    });
    created += 1;
  }

  return created;
}
