import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  AUTH_URL: z.string().url().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_FROM: z.string().optional(),
  MAILGUN_WEBHOOK_SIGNING_KEY: z.string().optional(),
  MAILGUN_INBOUND_ENABLED: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${message}`);
  }
  cached = parsed.data;
  return cached;
}

export function validateProductionEnv(): void {
  getServerEnv();
}

export function isMailgunConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN && env.MAILGUN_FROM);
}

export function isStripeConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
}

export function isMailgunInboundEnabled(): boolean {
  const value = process.env.MAILGUN_INBOUND_ENABLED;
  return value === "true" || value === "1";
}
