"use client";

import { ValidationChecklist } from "@/components/ui/ValidationChecklist";
import { getPhoneRequirements } from "@/lib/validators/fields";
import type { InputHTMLAttributes } from "react";

const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";
const inputClass =
  "w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold";

type PhoneFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
  showLiveValidation?: boolean;
  inputClassName?: string;
};

export function PhoneField({
  label = "Phone",
  value,
  onChange,
  error,
  optional = true,
  showLiveValidation = true,
  inputClassName = inputClass,
  id = "phone",
  name = "phone",
  autoComplete = "tel",
  placeholder = "(555) 555-5555",
  ...props
}: PhoneFieldProps) {
  const requirements = showLiveValidation
    ? getPhoneRequirements(value, optional)
    : [];
  const showChecklist =
    showLiveValidation && (optional ? value.trim().length > 0 : true);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional ? " (optional)" : <span className="text-gold"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
        {...props}
      />
      {showChecklist && requirements.length > 0 && (
        <ValidationChecklist items={requirements} className="mt-2" />
      )}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
