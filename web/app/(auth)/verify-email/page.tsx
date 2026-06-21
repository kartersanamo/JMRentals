"use client";

import { Button } from "@/components/ui/Button";
import { verifyEmailSchema } from "@/lib/validators/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type VerifyForm = z.infer<typeof verifyEmailSchema>;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") ?? "";
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: presetEmail,
      code: "",
    },
  });

  const onSubmit = async (data: VerifyForm) => {
    setError("");
    setInfo("");
    const res = await fetch("/api/portal/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email.toLowerCase(),
        code: data.code,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Verification failed.");
      return;
    }
    router.push("/login?verified=1");
  };

  const onResend = async () => {
    setError("");
    setInfo("");
    const email = getValues("email").trim().toLowerCase();
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setResending(true);
    try {
      const res = await fetch("/api/portal/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not resend code.");
        return;
      }
      setInfo("A new verification code was sent to your email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
          >
            6-Digit Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            {...register("code")}
            className="w-full border border-navy/20 bg-white px-4 py-3 text-navy text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:border-gold"
          />
          {errors.code && (
            <p className="mt-1 text-xs text-red-700">{errors.code.message}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>
        )}
        {info && (
          <p className="text-sm text-green-800 bg-green-50 p-3">{info}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Verify Email"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-sm text-gold hover:text-navy font-medium disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream p-8 md:p-10 shadow-xl border border-gold/20">
        <h1 className="font-display text-3xl text-navy text-center mb-2">
          Verify Your Email
        </h1>
        <p className="text-sm text-navy/60 text-center mb-8">
          We sent a 6-digit code to your inbox. Enter it below to activate your
          guest account.
        </p>

        <Suspense fallback={<p className="text-center text-navy/60">Loading…</p>}>
          <VerifyEmailForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-navy/60">
          Already verified?{" "}
          <Link href="/login" className="text-gold hover:text-navy font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
