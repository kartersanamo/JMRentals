"use client";

import { Button } from "@/components/ui/Button";
import { registerSchema } from "@/lib/validators/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    const res = await fetch("/api/portal/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed.");
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream p-8 md:p-10 shadow-xl border border-gold/20">
        <h1 className="font-display text-3xl text-navy text-center mb-2">Create Account</h1>
        <p className="text-sm text-navy/60 text-center mb-8">
          Register as a guest to explore units and apply
        </p>

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

          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
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
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-navy/60">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-navy font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
