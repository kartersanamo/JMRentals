"use client";

import { Button } from "@/components/ui/Button";
import { contactSchema, type ContactFormData } from "@/lib/validators/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      website: "",
    },
  });

  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to send your message. Please try again later.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-sage-light border border-gold/30 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-gold mx-auto mb-4" aria-hidden />
        <h3 className="font-display text-2xl text-navy mb-2">Message Sent!</h3>
        <p className="text-navy/70 text-sm">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm uppercase tracking-widest text-gold hover:text-navy transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="firstName" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
            First Name <span className="text-gold">*</span>
          </label>
          <input
            id="firstName"
            {...register("firstName")}
            className="w-full border border-navy/20 bg-cream px-4 py-3 text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-700">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
            Last Name <span className="text-gold">*</span>
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            className="w-full border border-navy/20 bg-cream px-4 py-3 text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-700">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
          Email Address <span className="text-gold">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full border border-navy/20 bg-cream px-4 py-3 text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full border border-navy/20 bg-cream px-4 py-3 text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs uppercase tracking-widest text-navy/70 mb-2">
          Message <span className="text-gold">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className="w-full border border-navy/20 bg-cream px-4 py-3 text-navy focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-y"
        />
        <div className="flex justify-between mt-1">
          {errors.message ? (
            <p className="text-xs text-red-700">{errors.message.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-navy/50">{512 - messageLength} characters left</p>
        </div>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
        aria-hidden
      />

      {status === "error" && (
        <div className="flex items-start gap-2 text-red-800 bg-red-50 p-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4 inline" aria-hidden />
            Sending...
          </>
        ) : (
          "Send My Message"
        )}
      </Button>
    </form>
  );
}
