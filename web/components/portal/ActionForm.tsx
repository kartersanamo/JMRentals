"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ActionForm({
  action,
  children,
  successMessage = "Saved successfully.",
  className = "space-y-4",
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  children: React.ReactNode;
  successMessage?: string;
  className?: string;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess(false);
    setPending(true);
    const result = await action(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form action={handleSubmit} className={className}>
      {children}
      {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
      {success && (
        <p className="text-sm text-green-800 bg-green-50 p-3">{successMessage}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Submit"}
      </Button>
    </form>
  );
}
