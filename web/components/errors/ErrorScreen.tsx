"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type ErrorScreenProps = {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
  backLabel?: string;
};

export function ErrorScreen({
  title = "Something went wrong",
  message = "We couldn't complete that request. Please try again or return to a safe page.",
  showRetry = true,
  onRetry,
  homeHref = "/",
  homeLabel = "Go to homepage",
  backLabel = "Go back",
}: ErrorScreenProps) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <AlertCircle className="h-8 w-8" aria-hidden />
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-navy mb-3">
          {title}
        </h1>
        <p className="text-navy/70 leading-relaxed mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
            {backLabel}
          </Button>

          {showRetry && onRetry ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
              Try again
            </Button>
          ) : null}

          <ButtonLink
            href={homeHref}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" aria-hidden />
            {homeLabel}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
