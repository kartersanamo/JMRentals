"use client";

import { Button } from "@/components/ui/Button";
import { updateChecklist } from "@/lib/actions/portal";
import { useState } from "react";

export function ChecklistForm({ initial }: { initial: Record<string, boolean> }) {
  const [items, setItems] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setPending(true);
    const fd = new FormData();
    fd.set("checklist", JSON.stringify(items));
    await updateChecklist(fd);
    setPending(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-3">
      {Object.keys(items).length === 0 ? (
        <p className="text-sm text-navy/60">Checklist not configured yet.</p>
      ) : (
        Object.entries(items).map(([label, checked]) => (
          <label key={label} className="flex items-center gap-3 text-sm text-navy cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) =>
                setItems((prev) => ({ ...prev, [label]: e.target.checked }))
              }
              className="h-4 w-4 accent-gold"
            />
            {label}
          </label>
        ))
      )}
      {saved && <p className="text-sm text-green-800">Progress saved.</p>}
      <Button type="button" onClick={handleSave} disabled={pending}>
        {pending ? "Saving…" : "Save Progress"}
      </Button>
    </div>
  );
}
