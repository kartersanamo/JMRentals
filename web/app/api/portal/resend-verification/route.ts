import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { db } from "@/lib/db";
import {
  generateVerificationCode,
  getVerificationExpiry,
  hashVerificationCode,
  sendGuestVerificationEmail,
} from "@/lib/email-verification";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { resendVerificationSchema } from "@/lib/validators/portal";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resendVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid email.", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const ip = getClientIp(request);
    if (!checkRateLimit(`resend-verify:${email}:${ip}`, 3)) {
      return jsonError("Too many resend requests. Please try again later.", 429);
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.role !== "GUEST" || user.emailVerifiedAt) {
      return jsonOk({ sent: true });
    }

    const code = generateVerificationCode();
    const emailVerifyCodeHash = await hashVerificationCode(code);
    const emailVerifyExpires = getVerificationExpiry();

    await db.user.update({
      where: { id: user.id },
      data: { emailVerifyCodeHash, emailVerifyExpires },
    });

    try {
      await sendGuestVerificationEmail(email, user.firstName, code);
    } catch (error) {
      if (error instanceof Error && error.message === "MAILGUN_NOT_CONFIGURED") {
        return jsonError(
          "Email verification is temporarily unavailable. Please try again later.",
          503
        );
      }

      console.error("Resend verification email error:", error);
      return jsonError("Failed to send verification email. Please try again.", 500);
    }

    return jsonOk({ sent: true });
  } catch (error) {
    return handleApiError(error);
  }
}
