import { db } from "@/lib/db";
import { extractEmailAddress } from "@/lib/mailgun";
import {
  dispatchPortalNotification,
  notifyPortalMessageToUser,
} from "@/lib/notifications/dispatch";
import { isFeatureEnabled } from "@/lib/settings/store";

export async function createStaffReplyFromEmail(
  threadId: string,
  senderRaw: string,
  body: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!(await isFeatureEnabled("portalMessages"))) {
    return { ok: false, reason: "portal_messages_disabled" };
  }

  const senderEmail = extractEmailAddress(senderRaw).toLowerCase();
  const staffUser = await db.user.findUnique({
    where: { email: senderEmail },
    select: { id: true, role: true, status: true },
  });

  if (
    !staffUser ||
    staffUser.status !== "ACTIVE" ||
    (staffUser.role !== "ADMIN" && staffUser.role !== "STAFF")
  ) {
    return { ok: false, reason: "unauthorized_sender" };
  }

  const thread = await db.messageThread.findUnique({
    where: { id: threadId },
    select: { id: true },
  });
  if (!thread) {
    return { ok: false, reason: "thread_not_found" };
  }

  const trimmedBody = body.trim();
  if (!trimmedBody) {
    return { ok: false, reason: "empty_body" };
  }

  const message = await db.message.create({
    data: {
      threadId,
      senderId: staffUser.id,
      body: trimmedBody,
    },
  });

  await db.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  await dispatchPortalNotification(() =>
    notifyPortalMessageToUser(message.id)
  );

  return { ok: true };
}
