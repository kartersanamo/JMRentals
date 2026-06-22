"use client";

import { ErrorScreen } from "@/components/errors/ErrorScreen";
import { useEffect } from "react";

export default function Error({
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
      title="Something went wrong"
      message="This page ran into a problem. You can go back, try again, or return to the homepage."
      onRetry={reset}
      homeHref="/"
      homeLabel="Go to homepage"
    />
  );
}
