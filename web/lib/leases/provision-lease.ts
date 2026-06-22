import { getDefaultChecklist } from "@/lib/portal/checklist";
import type { Application, Prisma, Unit, User } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export type ProvisionLeaseInput = {
  residentId: string;
  unitId: string;
  startDate: Date;
  endDate?: Date | null;
  monthlyRent: number;
  houseRules?: string | null;
};

export async function provisionLease(
  tx: TransactionClient,
  input: ProvisionLeaseInput
) {
  const lease = await tx.lease.create({
    data: {
      residentId: input.residentId,
      unitId: input.unitId,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      monthlyRent: input.monthlyRent,
      houseRules: input.houseRules ?? null,
      status: "PENDING",
    },
  });

  await tx.unit.update({
    where: { id: input.unitId },
    data: { status: "OCCUPIED" },
  });

  await tx.user.update({
    where: { id: input.residentId },
    data: { role: "RESIDENT" },
  });

  await tx.residentProfile.upsert({
    where: { userId: input.residentId },
    create: {
      userId: input.residentId,
      checklistProgress: await getDefaultChecklist(),
    },
    update: {},
  });

  return lease;
}

type ApplicationWithRelations = Application & {
  guest: User;
  desiredUnit: Unit | null;
};

export function validateApplicationForAutoLease(
  application: ApplicationWithRelations
): { error: string } | { unit: Unit } {
  if (!application.desiredUnitId || !application.desiredUnit) {
    return {
      error:
        "Cannot approve automatically: this application has no unit selected. Assign a lease manually from Residents or Leases & Billing.",
    };
  }

  if (application.desiredUnit.status !== "AVAILABLE") {
    return {
      error: `Cannot approve automatically: ${application.desiredUnit.name} is not available. Assign a different unit manually.`,
    };
  }

  return { unit: application.desiredUnit };
}

export async function provisionLeaseForApprovedApplication(
  tx: TransactionClient,
  application: ApplicationWithRelations
) {
  const validation = validateApplicationForAutoLease(application);
  if ("error" in validation) {
    return validation;
  }

  const existingLease = await tx.lease.findFirst({
    where: {
      residentId: application.guestId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    select: { id: true },
  });

  if (existingLease) {
    return {
      error:
        "This applicant already has a pending or active lease. Update it from Leases & Billing instead.",
    };
  }

  const lease = await provisionLease(tx, {
    residentId: application.guestId,
    unitId: validation.unit.id,
    startDate: application.moveInDate ?? new Date(),
    monthlyRent: Number(validation.unit.monthlyRent),
  });

  return {
    leaseId: lease.id,
    unitName: validation.unit.name,
    monthlyRent: Number(validation.unit.monthlyRent),
    residentId: application.guestId,
  };
}
