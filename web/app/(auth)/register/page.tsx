import { RegisterForm } from "@/components/auth/RegisterForm";
import { isFeatureEnabled } from "@/lib/settings/store";
import Link from "next/link";

export default async function RegisterPage() {
  const enabled = await isFeatureEnabled("guestRegistration");

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream p-8 md:p-10 shadow-xl border border-gold/20">
        <h1 className="font-display text-3xl text-navy text-center mb-2">Create Account</h1>
        <p className="text-sm text-navy/60 text-center mb-8">
          Register as a guest to explore units and apply
        </p>

        {enabled ? (
          <RegisterForm />
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-navy/70">
              Guest registration is currently disabled. Please contact the office for assistance.
            </p>
            <Link href="/login" className="text-gold hover:text-navy text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
