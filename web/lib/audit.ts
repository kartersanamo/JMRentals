import { db } from "@/lib/db";

export async function createAuditLog(params: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}) {
  return db.auditLog.create({
    data: params,
  });
}
