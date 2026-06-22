import { z } from "zod";

export interface ValidationRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  const digits = normalizePhoneDigits(trimmed);
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return z.string().email().safeParse(trimmed).success;
}

export function isStrongPassword(password: string): boolean {
  return getPasswordRequirements(password).every((rule) => rule.met);
}

export function getPasswordRequirements(
  password: string,
  confirmPassword?: string
): ValidationRequirement[] {
  const rules: ValidationRequirement[] = [
    {
      id: "length",
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number",
      met: /\d/.test(password),
    },
    {
      id: "special",
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  if (confirmPassword !== undefined) {
    rules.push({
      id: "match",
      label: "Passwords match",
      met: password.length > 0 && password === confirmPassword,
    });
  }

  return rules;
}

export function getEmailRequirements(value: string): ValidationRequirement[] {
  if (!value.trim()) return [];

  return [
    {
      id: "format",
      label: "Valid email address (name@domain.com)",
      met: isValidEmail(value),
    },
  ];
}

export function getPhoneRequirements(
  value: string,
  optional = true
): ValidationRequirement[] {
  if (optional && !value.trim()) return [];

  return [
    {
      id: "format",
      label: "Valid 10-digit US phone number",
      met: isValidPhone(value),
    },
  ];
}

export const emailFieldSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254);

export const optionalEmailFieldSchema = z
  .string()
  .trim()
  .max(254)
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || isValidEmail(value), {
    message: "Please enter a valid email address",
  });

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must include an uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must include a lowercase letter",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must include a number",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must include a special character",
  });

export const optionalPhoneFieldSchema = z
  .string()
  .trim()
  .max(30)
  .optional()
  .or(z.literal(""))
  .refine((value) => isValidPhone(value ?? ""), {
    message: "Enter a valid 10-digit US phone number",
  });

export function passwordsMatchRefine<T extends { password: string; confirmPassword: string }>(
  data: T
) {
  return data.password === data.confirmPassword;
}

export function newPasswordsMatchRefine<
  T extends { newPassword: string; confirmPassword: string },
>(data: T) {
  return data.newPassword === data.confirmPassword;
}

export const passwordMatchMessage = "Passwords do not match";
