import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";
import { isNotificationEnabled, type NotificationKey } from "./catalog";

export async function getNotificationRecipientEmails(
  key: NotificationKey,
  roles: UserRole[]
): Promise<string[]> {
  const users = await db.user.findMany({
    where: {
      role: { in: roles },
      status: "ACTIVE",
    },
    select: {
      email: true,
      role: true,
      emailNotifications: true,
    },
  });

  return users
    .filter((user) =>
      isNotificationEnabled(user.role, user.emailNotifications, key)
    )
    .map((user) => user.email);
}

export async function getContactFormRecipientEmails(): Promise<string[]> {
  const fromNotifications = await getNotificationRecipientEmails(
    "website_contact_form",
    ["ADMIN", "STAFF"]
  );

  if (fromNotifications.length > 0) {
    return fromNotifications;
  }

  const fallback = process.env.CONTACT_TO_EMAIL?.trim();
  return fallback ? [fallback] : [];
}
