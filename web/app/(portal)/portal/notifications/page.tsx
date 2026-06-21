import { NotificationPreferencesForm } from "@/components/portal/NotificationPreferencesForm";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getEffectiveNotificationPreferences,
  getNotificationsForRole,
} from "@/lib/notifications/catalog";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, emailNotifications: true },
  });
  if (!user) redirect("/login");

  const items = getNotificationsForRole(user.role);
  const preferences = getEffectiveNotificationPreferences(
    user.role,
    user.emailNotifications
  );

  return (
    <div>
      <PortalPageHeader
        title="Email Notifications"
        subtitle="Choose which portal activity sends an email to your inbox. Changes apply to your account only."
      />
      <PortalCard>
        {items.length === 0 ? (
          <p className="text-sm text-navy/60">
            No email notifications are available for your account type.
          </p>
        ) : (
          <NotificationPreferencesForm
            items={items}
            initialPreferences={preferences}
          />
        )}
      </PortalCard>
      <p className="mt-6 text-sm text-navy/50">
        Emails are sent from J&M Rentals when enabled events occur. You can turn
        individual notifications on or off at any time.
      </p>
    </div>
  );
}
