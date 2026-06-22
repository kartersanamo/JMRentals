"use client";

import { ErrorScreen } from "@/components/errors/ErrorScreen";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en">
      <body className="antialiased bg-cream text-navy min-h-screen">
        <ErrorScreen
          title="Something went wrong"
          message="The site hit an unexpected error. Please try again or return to the homepage."
          onRetry={reset}
          homeHref="/"
          homeLabel="Go to homepage"
        />
      </body>
    </html>
  );
}
