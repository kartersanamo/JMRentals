import { db } from "@/lib/db";
import type { Document, UserRole } from "@prisma/client";

export async function canAccessDocument(
  userId: string,
  role: UserRole,
  document: Pick<Document, "residentId" | "unitId" | "isGlobal">
): Promise<boolean> {
  if (role === "ADMIN" || role === "STAFF") return true;
  if (role !== "RESIDENT") return false;
  if (document.residentId === userId) return true;
  if (document.isGlobal) return true;
  if (document.unitId) {
    const lease = await db.lease.findFirst({
      where: { residentId: userId, status: { in: ["PENDING", "ACTIVE"] } },
      select: { unitId: true },
    });
    return lease?.unitId === document.unitId;
  }
  return false;
}

export function documentCategoryLabel(
  category: Document["category"]
): string {
  switch (category) {
    case "LEASE":
      return "Lease";
    case "ADDENDUM":
      return "Addendum";
    case "RULES":
      return "House Rules";
    case "RECEIPT":
      return "Receipt";
    default:
      return "Document";
  }
}
