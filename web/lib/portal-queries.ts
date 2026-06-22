import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getActiveLease(residentId: string) {
  return db.lease.findFirst({
    where: { residentId, status: "ACTIVE" },
    include: { unit: true, leaseDocument: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getResidentLease(residentId: string) {
  return db.lease.findFirst({
    where: { residentId, status: { in: ["PENDING", "ACTIVE"] } },
    include: {
      unit: true,
      leaseDocument: true,
      documents: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResidentBalance(residentId: string) {
  const payments = await db.paymentRecord.findMany({
    where: { residentId },
    orderBy: { dueDate: "desc" },
  });
  const unpaid = payments.filter((p) => !p.paidAt);
  const balance = unpaid.reduce((sum, p) => sum + Number(p.amount), 0);
  const nextDue = unpaid.sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  )[0];
  return { payments, balance, nextDue };
}

export async function getHomeInfo() {
  const setting = await db.portalSetting.findUnique({
    where: { key: "home_info" },
  });
  if (!setting) {
    return {
      utilities: "",
      trash: "",
      parking: "",
      wifi: "",
      emergency: "",
    };
  }
  try {
    return JSON.parse(setting.value) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function requirePortalUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function getAnnouncementsForResident(residentId: string) {
  const lease = await getActiveLease(residentId);
  return db.announcement.findMany({
    where: {
      OR: [{ unitId: null }, { unitId: lease?.unitId ?? undefined }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: { select: { firstName: true, lastName: true } } },
  });
}
