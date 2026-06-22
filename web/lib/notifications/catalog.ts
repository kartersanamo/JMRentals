import type { UserRole } from "@prisma/client";

export type NotificationKey =
  | "application_submitted"
  | "application_status_changed"
  | "application_proposal"
  | "maintenance_submitted"
  | "maintenance_status_changed"
  | "portal_message_to_staff"
  | "portal_message_to_user"
  | "announcement_posted"
  | "payment_recorded"
  | "payment_received"
  | "lease_created"
  | "lease_signed"
  | "website_contact_form";

export type NotificationCategory =
  | "applications"
  | "maintenance"
  | "messages"
  | "announcements"
  | "account";

export interface NotificationDefinition {
  key: NotificationKey;
  category: NotificationCategory;
  label: string;
  description: string;
  roles: UserRole[];
  defaultEnabled: boolean;
}

export const NOTIFICATION_CATALOG: NotificationDefinition[] = [
  {
    key: "application_submitted",
    category: "applications",
    label: "New rental applications",
    description: "When a guest submits a rental application",
    roles: ["ADMIN", "STAFF"],
    defaultEnabled: true,
  },
  {
    key: "application_status_changed",
    category: "applications",
    label: "Application status updates",
    description: "When staff reviews or updates your application",
    roles: ["GUEST"],
    defaultEnabled: true,
  },
  {
    key: "application_proposal",
    category: "applications",
    label: "Lease term proposals",
    description: "When staff proposes lease changes for you to confirm",
    roles: ["GUEST"],
    defaultEnabled: true,
  },
  {
    key: "maintenance_submitted",
    category: "maintenance",
    label: "New maintenance requests",
    description: "When a resident submits a maintenance request",
    roles: ["ADMIN", "STAFF"],
    defaultEnabled: true,
  },
  {
    key: "maintenance_status_changed",
    category: "maintenance",
    label: "Maintenance request updates",
    description: "When staff updates the status of your maintenance request",
    roles: ["RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "portal_message_to_staff",
    category: "messages",
    label: "New guest & resident messages",
    description: "When someone sends a message through the portal",
    roles: ["ADMIN", "STAFF"],
    defaultEnabled: true,
  },
  {
    key: "website_contact_form",
    category: "messages",
    label: "Website contact form",
    description: "When someone submits the contact form on the public website",
    roles: ["ADMIN", "STAFF"],
    defaultEnabled: true,
  },
  {
    key: "portal_message_to_user",
    category: "messages",
    label: "Replies from staff",
    description: "When staff replies to your portal message thread",
    roles: ["GUEST", "RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "announcement_posted",
    category: "announcements",
    label: "Community announcements",
    description: "When staff posts a new announcement for your community",
    roles: ["GUEST", "RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "payment_recorded",
    category: "announcements",
    label: "Payment & balance updates",
    description: "When a new payment or balance entry is added to your account",
    roles: ["RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "payment_received",
    category: "announcements",
    label: "Payment confirmations",
    description: "When an online or manual payment is marked received",
    roles: ["RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "lease_created",
    category: "account",
    label: "Lease & move-in updates",
    description: "When a lease is created or you are promoted to resident",
    roles: ["GUEST", "RESIDENT"],
    defaultEnabled: true,
  },
  {
    key: "lease_signed",
    category: "account",
    label: "Lease signed by resident",
    description: "When a resident signs their lease in the portal",
    roles: ["ADMIN", "STAFF"],
    defaultEnabled: true,
  },
];

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  applications: "Applications",
  maintenance: "Maintenance",
  messages: "Messages",
  announcements: "Announcements & Payments",
  account: "Account",
};

export function getCategoryLabel(category: NotificationCategory): string {
  return CATEGORY_LABELS[category];
}

export function getNotificationsForRole(
  role: UserRole
): NotificationDefinition[] {
  return NOTIFICATION_CATALOG.filter((item) => item.roles.includes(role));
}

export function getNotificationDefinition(
  key: NotificationKey
): NotificationDefinition | undefined {
  return NOTIFICATION_CATALOG.find((item) => item.key === key);
}

export type NotificationPreferences = Partial<Record<NotificationKey, boolean>>;

export function parseNotificationPreferences(
  value: unknown
): NotificationPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result: NotificationPreferences = {};
  for (const item of NOTIFICATION_CATALOG) {
    const stored = (value as Record<string, unknown>)[item.key];
    if (typeof stored === "boolean") {
      result[item.key] = stored;
    }
  }
  return result;
}

export function getEffectiveNotificationPreferences(
  role: UserRole,
  stored: unknown
): Record<NotificationKey, boolean> {
  const parsed = parseNotificationPreferences(stored);
  const effective = {} as Record<NotificationKey, boolean>;

  for (const item of NOTIFICATION_CATALOG) {
    if (!item.roles.includes(role)) continue;
    effective[item.key] = parsed[item.key] ?? item.defaultEnabled;
  }

  return effective;
}

export function isNotificationEnabled(
  role: UserRole,
  stored: unknown,
  key: NotificationKey
): boolean {
  const definition = getNotificationDefinition(key);
  if (!definition || !definition.roles.includes(role)) return false;
  const parsed = parseNotificationPreferences(stored);
  return parsed[key] ?? definition.defaultEnabled;
}

export function groupNotificationsByCategory(
  items: NotificationDefinition[]
): Array<{ category: NotificationCategory; label: string; items: NotificationDefinition[] }> {
  const categories = Array.from(new Set(items.map((item) => item.category)));
  return categories.map((category) => ({
    category,
    label: getCategoryLabel(category),
    items: items.filter((item) => item.category === category),
  }));
}
