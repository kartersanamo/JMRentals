"use client";

import { Button } from "@/components/ui/Button";
import { EmailField } from "@/components/ui/EmailField";
import { PasswordFields } from "@/components/ui/PasswordFields";
import { PhoneField } from "@/components/ui/PhoneField";
import { registerSchema } from "@/lib/validators/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const email = watch("email") ?? "";
  const phone = watch("phone") ?? "";
  const password = watch("password") ?? "";
  const confirmPassword = watch("confirmPassword") ?? "";

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    const { confirmPassword: _confirmPassword, ...payload } = data;
    const res = await fetch("/api/portal/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed.");
      return;
    }
    if (json.verified || !json.needsVerification) {
      router.push(
        `/login?verified=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
      return;
    }
    router.push(
      `/verify-email?email=${encodeURIComponent(json.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              {...register("firstName")}
              className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-700">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              {...register("lastName")}
              className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-700">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <EmailField
          value={email}
          onChange={(value) =>
            setValue("email", value, { shouldValidate: true, shouldDirty: true })
          }
          error={errors.email?.message}
          required
        />

        <PhoneField
          value={phone}
          onChange={(value) =>
            setValue("phone", value, { shouldValidate: true, shouldDirty: true })
          }
          error={errors.phone?.message}
        />

        <PasswordFields
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={(value) =>
            setValue("password", value, { shouldValidate: true, shouldDirty: true })
          }
          onConfirmPasswordChange={(value) =>
            setValue("confirmPassword", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
        />

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-gold hover:text-navy font-medium"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
