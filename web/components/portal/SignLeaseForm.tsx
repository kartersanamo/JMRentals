"use client";

import { ActionForm } from "@/components/portal/ActionForm";
import { signLease } from "@/lib/actions/billing";

export function SignLeaseForm({
  leaseId,
  residentName,
}: {
  leaseId: string;
  residentName: string;
}) {
  return (
    <ActionForm
      action={signLease}
      successMessage="Lease signed successfully. Welcome home!"
      submitLabel="Sign Lease"
      className="space-y-4"
    >
      <input type="hidden" name="leaseId" value={leaseId} />
      <p className="text-sm text-navy/70">
        By signing below, you agree to the lease terms, monthly rent, house rules, and
        property policies for your unit.
      </p>
      <label className="block text-sm text-navy">
        <span className="block mb-1 text-navy/60">Full legal name</span>
        <input
          name="signedByName"
          required
          defaultValue={residentName}
          className="w-full border border-navy/20 px-4 py-3 bg-white text-navy"
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-navy cursor-pointer">
        <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 accent-gold" />
        <span>
          I have read the lease agreement and accept all terms, including rent amount,
          lease dates, and house rules.
        </span>
      </label>
    </ActionForm>
  );
}
