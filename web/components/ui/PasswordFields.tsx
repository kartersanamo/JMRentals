"use client";

import { ValidationChecklist } from "@/components/ui/ValidationChecklist";
import { getPasswordRequirements } from "@/lib/validators/fields";

const labelClass =
  "block text-xs uppercase tracking-widest text-navy/70 mb-2";
const inputClass =
  "w-full border border-navy/20 bg-white px-4 py-3 text-navy focus:outline-none focus:border-gold";

type PasswordFieldsProps = {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordError?: string;
  confirmError?: string;
  showRequirements?: boolean;
  inputClassName?: string;
  passwordId?: string;
  confirmId?: string;
};

export function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordLabel = "Password",
  confirmLabel = "Confirm Password",
  passwordError,
  confirmError,
  showRequirements = true,
  inputClassName = inputClass,
  passwordId = "password",
  confirmId = "confirmPassword",
}: PasswordFieldsProps) {
  const requirements =
    showRequirements && (password.length > 0 || confirmPassword.length > 0)
      ? getPasswordRequirements(password, confirmPassword)
      : [];

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={passwordId} className={labelClass}>
          {passwordLabel}
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={(event) => onPasswordChange(event.target.value)}
          className={inputClassName}
        />
        {passwordError && (
          <p className="mt-1 text-xs text-red-700">{passwordError}</p>
        )}
      </div>

      <div>
        <label htmlFor={confirmId} className={labelClass}>
          {confirmLabel}
        </label>
        <input
          id={confirmId}
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          className={inputClassName}
        />
        {confirmError && (
          <p className="mt-1 text-xs text-red-700">{confirmError}</p>
        )}
      </div>

      {requirements.length > 0 && (
        <ValidationChecklist items={requirements} />
      )}
    </div>
  );
}
