"use client";

import { ValidationChecklist } from "@/components/ui/ValidationChecklist";
import { getEmailRequirements } from "@/lib/validators/fields";
import type { InputHTMLAttributes } from "react";

const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";
const inputClass =
  "w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold";

type EmailFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showLiveValidation?: boolean;
  required?: boolean;
  inputClassName?: string;
};

export function EmailField({
  label = "Email",
  value,
  onChange,
  error,
  showLiveValidation = true,
  required = false,
  inputClassName = inputClass,
  id = "email",
  name = "email",
  autoComplete = "email",
  ...props
}: EmailFieldProps) {
  const requirements = showLiveValidation ? getEmailRequirements(value) : [];
  const showChecklist = showLiveValidation && value.trim().length > 0;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type="email"
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
        {...props}
      />
      {showChecklist && (
        <ValidationChecklist items={requirements} className="mt-2" />
      )}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
