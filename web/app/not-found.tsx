import { ButtonLink } from "@/components/ui/Button";
import { SiteLogo } from "@/components/brand/SiteLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-navy">
      <SiteLogo size="lg" linked className="mb-8" />
      <div className="w-full max-w-lg text-center">
        <p className="text-sm uppercase tracking-widest text-gold mb-2">404</p>
        <h1 className="font-display text-3xl md:text-4xl text-cream mb-3">
          Page not found
        </h1>
        <p className="text-cream/70 leading-relaxed mb-8">
          That page doesn&apos;t exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <ButtonLink href="/" variant="primary">
            Go to homepage
          </ButtonLink>
          <Link
            href="/contact"
            className="text-sm uppercase tracking-wider text-cream/70 hover:text-gold transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
