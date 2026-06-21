import { getMailgunClient, getMailFromAddress } from "@/lib/mailgun";
import { hashPassword, verifyPassword } from "@/lib/password";

export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_CODE_EXPIRY_MS = 15 * 60 * 1000;

export function generateVerificationCode(): string {
  const max = 10 ** VERIFICATION_CODE_LENGTH;
  const value = Math.floor(Math.random() * max);
  return value.toString().padStart(VERIFICATION_CODE_LENGTH, "0");
}

export async function hashVerificationCode(code: string): Promise<string> {
  return hashPassword(code);
}

export async function verifyVerificationCode(
  code: string,
  hash: string
): Promise<boolean> {
  return verifyPassword(code, hash);
}

export function getVerificationExpiry(): Date {
  return new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS);
}

export async function sendGuestVerificationEmail(
  to: string,
  firstName: string,
  code: string
): Promise<void> {
  const mailgun = getMailgunClient();
  const from = getMailFromAddress();
  const domain = process.env.MAILGUN_DOMAIN;

  if (!mailgun || !from || !domain) {
    throw new Error("MAILGUN_NOT_CONFIGURED");
  }

  const siteName = "J&M Rentals";

  await mailgun.messages.create(domain, {
    from,
    to: [to],
    subject: `${code} is your ${siteName} verification code`,
    text: `Hi ${firstName},

Thanks for creating a guest account at ${siteName}.

Your verification code is: ${code}

Enter this code on the website to verify your email. The code expires in 15 minutes.

If you did not create an account, you can ignore this email.

— ${siteName}
`,
    html: `
<p>Hi ${firstName},</p>
<p>Thanks for creating a guest account at ${siteName}.</p>
<p style="font-size: 28px; letter-spacing: 0.3em; font-weight: bold; margin: 24px 0;">${code}</p>
<p>Enter this code on the website to verify your email. The code expires in 15 minutes.</p>
<p>If you did not create an account, you can ignore this email.</p>
<p>— ${siteName}</p>
`,
  });
}
