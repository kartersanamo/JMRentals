"use client";

import { Button } from "@/components/ui/Button";
import { createAdminStripeCharge } from "@/lib/actions/billing";
import { useState } from "react";

const fieldClass = "w-full border border-navy/20 px-4 py-3 bg-white text-navy";

export function AdminStripeChargeForm({
  residents,
}: {
  residents: Array<{ id: string; label: string }>;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setPending(true);
    const result = await createAdminStripeCharge(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("url" in result && result.url) {
      setSuccess("Charge created. Opening Stripe checkout…");
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setSuccess("Charge created and sent to the resident.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <select name="residentId" required className={fieldClass}>
        <option value="">Select resident</option>
        {residents.map((resident) => (
          <option key={resident.id} value={resident.id}>
            {resident.label}
          </option>
        ))}
      </select>
      <input
        name="description"
        required
        placeholder="Description (e.g. Late fee, pet deposit)"
        className={fieldClass}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          required
          placeholder="Amount"
          className={fieldClass}
        />
        <input
          type="date"
          name="dueDate"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={fieldClass}
        />
      </div>
      <p className="text-sm text-navy/60">
        Creates a Stripe charge and notifies the resident. You can also open the checkout
        link to collect payment on their behalf.
      </p>
      {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
      {success && <p className="text-sm text-green-800 bg-green-50 p-3">{success}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating charge…" : "Charge via Stripe"}
      </Button>
    </form>
  );
}
