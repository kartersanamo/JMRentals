import { ButtonLink } from "@/components/ui/Button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy">
          <FileQuestion className="h-8 w-8" aria-hidden />
        </div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">404</p>
        <h1 className="font-display text-3xl md:text-4xl text-navy mb-3">
          Page not found
        </h1>
        <p className="text-navy/70 leading-relaxed mb-8">
          That page doesn&apos;t exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <ButtonLink href="/" variant="primary">
            Go to homepage
          </ButtonLink>
          <Link
            href="/contact"
            className="text-sm uppercase tracking-wider text-navy/70 hover:text-navy transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
