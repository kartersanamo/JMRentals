"use client";

import { Button } from "@/components/ui/Button";
import { loginSchema } from "@/lib/validators/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    const result = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <>
      {passwordUpdated && (
        <p className="text-sm text-green-800 bg-green-50 p-3 mb-4">
          Password updated. Sign in with your new password.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
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
          <label htmlFor="password" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-700">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        New here?{" "}
        <Link href="/register" className="text-gold hover:text-navy font-medium">
          Create a guest account
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-xs uppercase tracking-widest text-navy/50 hover:text-gold">
          Back to website
        </Link>
      </p>
    </>
  );
}
