"use client";

import { ErrorScreen } from "@/components/errors/ErrorScreen";
import { useEffect } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      title="Portal unavailable"
      message="We couldn't load this portal page. Your account is still signed in — try again or return to your dashboard."
      onRetry={reset}
      homeHref="/portal"
      homeLabel="Portal home"
    />
  );
}
