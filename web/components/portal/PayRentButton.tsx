"use client";

import { Button } from "@/components/ui/Button";
import { startRentCheckout } from "@/lib/actions/billing";
import { useState } from "react";

export function PayRentButton({
  paymentId,
  payAll = false,
  label,
  compact = false,
}: {
  paymentId?: string;
  payAll?: boolean;
  label: string;
  compact?: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handlePay() {
    setError("");
    setPending(true);
    const formData = new FormData();
    if (payAll) {
      formData.set("payAll", "true");
    } else if (paymentId) {
      formData.set("paymentId", paymentId);
    }
    const result = await startRentCheckout(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("url" in result && result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className={compact ? "inline-flex flex-col items-end gap-1" : "space-y-2"}>
      <Button type="button" onClick={handlePay} disabled={pending} size={compact ? "sm" : "md"}>
        {pending ? "Redirecting…" : label}
      </Button>
      {error && (
        <p className={compact ? "text-xs text-red-700" : "text-sm text-red-700 bg-red-50 p-2"}>
          {error}
        </p>
      )}
    </div>
  );
}
