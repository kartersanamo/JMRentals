"use client";

import { Button } from "@/components/ui/Button";
import { EmailField } from "@/components/ui/EmailField";
import { loginSchema } from "@/lib/validators/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";
  const verified = searchParams.get("verified") === "1";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const email = watch("email") ?? "";

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    const result = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      if (
        result.code === "email_not_verified" ||
        result.error === "email_not_verified"
      ) {
        setError("Please verify your email before signing in.");
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email.toLowerCase())}`
        );
        return;
      }
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
      {verified && (
        <p className="text-sm text-green-800 bg-green-50 p-3 mb-4">
          Email verified. You can sign in now.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <EmailField
          value={email}
          onChange={(value) =>
            setValue("email", value, { shouldValidate: true, shouldDirty: true })
          }
          error={errors.email?.message}
          required
        />

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
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-gold hover:text-navy font-medium"
        >
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
