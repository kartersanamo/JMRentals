"use client";

import { Button } from "@/components/ui/Button";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { contactSchema, type ContactFormData } from "@/lib/validators/contact";
import { site } from "@/lib/site-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

/** Set to true when Mailgun / contact API is ready. */
const CONTACT_FORM_ENABLED = false;

const disabledFieldClass =
  "w-full border border-navy/20 bg-cream/60 px-4 py-3 text-navy/50 cursor-not-allowed";

function ContactFormComingSoon() {
  return (
    <div className="space-y-5">
      <ComingSoonBanner
        title="Online Contact Form — Coming Soon"
        description={`We're setting up messaging on the site. For now, please call us at ${site.phone} or email ${site.email}.`}
      />
      <fieldset disabled className="space-y-5 opacity-80" aria-label="Contact form preview">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="firstName-preview"
              className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
            >
              First Name <span className="text-gold">*</span>
            </label>
            <input
              id="firstName-preview"
              disabled
              className={disabledFieldClass}
              placeholder="First name"
            />
          </div>
          <div>
            <label
              htmlFor="lastName-preview"
              className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
            >
              Last Name <span className="text-gold">*</span>
            </label>
            <input
              id="lastName-preview"
              disabled
              className={disabledFieldClass}
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email-preview"
            className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
          >
            Email Address <span className="text-gold">*</span>
          </label>
          <input
            id="email-preview"
            type="email"
            disabled
            className={disabledFieldClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone-preview"
            className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
          >
            Phone Number
          </label>
          <input
            id="phone-preview"
            type="tel"
            disabled
            className={disabledFieldClass}
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label
            htmlFor="message-preview"
            className="block text-xs uppercase tracking-widest text-navy/70 mb-2"
          >
            Message <span className="text-gold">*</span>
          </label>
          <textarea
            id="message-preview"
            rows={5}
            disabled
            className={`${disabledFieldClass} resize-y`}
            placeholder="Your message"
          />
          <p className="mt-1 text-xs text-navy/50 text-right">512 characters left</p>
        </div>

        <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto" disabled>
          Coming Soon
        </Button>
      </fieldset>
    </div>
  );
}

function ContactFormActive() {
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

export function ContactForm() {
  if (!CONTACT_FORM_ENABLED) {
    return <ContactFormComingSoon />;
  }
  return <ContactFormActive />;
}
