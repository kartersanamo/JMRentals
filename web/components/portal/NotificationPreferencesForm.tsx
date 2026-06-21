"use client";

import { Button } from "@/components/ui/Button";
import { updateNotificationPreferences } from "@/lib/actions/portal";
import type { NotificationDefinition } from "@/lib/notifications/catalog";
import {
  groupNotificationsByCategory,
  type NotificationKey,
} from "@/lib/notifications/catalog";
import { useMemo, useState } from "react";

export function NotificationPreferencesForm({
  items,
  initialPreferences,
}: {
  items: NotificationDefinition[];
  initialPreferences: Record<NotificationKey, boolean>;
}) {
  const grouped = useMemo(() => groupNotificationsByCategory(items), [items]);
  const [preferences, setPreferences] =
    useState<Record<NotificationKey, boolean>>(initialPreferences);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function toggle(key: NotificationKey) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setSuccess(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setPending(true);

    const formData = new FormData();
    formData.set("preferences", JSON.stringify(preferences));
    const result = await updateNotificationPreferences(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {grouped.map((group) => (
        <section key={group.category}>
          <h3 className="font-display text-xl text-navy mb-4">{group.label}</h3>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-4 border border-navy/10 p-4 bg-white"
              >
                <input
                  id={`notify-${item.key}`}
                  type="checkbox"
                  checked={preferences[item.key] ?? item.defaultEnabled}
                  onChange={() => toggle(item.key)}
                  className="mt-1 h-4 w-4 accent-gold"
                />
                <label htmlFor={`notify-${item.key}`} className="flex-1 cursor-pointer">
                  <span className="block font-medium text-navy">{item.label}</span>
                  <span className="block text-sm text-navy/60 mt-1">
                    {item.description}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-800 bg-green-50 p-3">
          Email notification preferences saved.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
