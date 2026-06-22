import { LoginForm } from "@/components/auth/LoginForm";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream p-8 md:p-10 shadow-xl border border-gold/20">
        <div className="flex justify-center mb-6">
          <SiteLogo size="lg" linked />
        </div>
        <h1 className="font-display text-3xl text-navy text-center mb-2">Sign In</h1>
        <p className="text-sm text-navy/60 text-center mb-8">
          Access your J&M Rentals portal
        </p>
        <Suspense fallback={<p className="text-center text-navy/60">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
