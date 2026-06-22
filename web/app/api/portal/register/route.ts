import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { db } from "@/lib/db";
import {
  generateVerificationCode,
  getVerificationExpiry,
  hashVerificationCode,
  sendGuestVerificationEmail,
} from "@/lib/email-verification";
import { hashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { isFeatureEnabled } from "@/lib/settings/store";
import { registerSchema } from "@/lib/validators/portal";
import { NextRequest } from "next/server";

async function issueVerificationCode(
  userId: string,
  email: string,
  firstName: string
) {
  const code = generateVerificationCode();
  const emailVerifyCodeHash = await hashVerificationCode(code);
  const emailVerifyExpires = getVerificationExpiry();

  await db.user.update({
    where: { id: userId },
    data: { emailVerifyCodeHash, emailVerifyExpires },
  });

  await sendGuestVerificationEmail(email, firstName, code);
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isFeatureEnabled("guestRegistration"))) {
      return jsonError("Guest registration is currently disabled.", 503);
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid registration data.", 400);
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`register:${ip}`, 10)) {
      return jsonError("Too many registration attempts. Please try again later.", 429);
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });

    if (existing?.emailVerifiedAt) {
      return jsonError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    let userId: string;
    let firstName: string;

    if (existing) {
      if (existing.role !== "GUEST") {
        return jsonError("An account with this email already exists.", 409);
      }

      await db.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
        },
      });
      userId = existing.id;
      firstName = parsed.data.firstName;
    } else {
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          role: "GUEST",
        },
      });
      userId = user.id;
      firstName = parsed.data.firstName;
    }

    const requireVerification = await isFeatureEnabled("guestEmailVerification");

    if (!requireVerification) {
      await db.user.update({
        where: { id: userId },
        data: {
          emailVerifiedAt: new Date(),
          emailVerifyCodeHash: null,
          emailVerifyExpires: null,
        },
      });
      return jsonOk({ email, needsVerification: false, verified: true }, 201);
    }

    try {
      await issueVerificationCode(userId, email, firstName);
    } catch (error) {
      if (!existing) {
        await db.user.delete({ where: { id: userId } }).catch(() => undefined);
      }

      if (error instanceof Error && error.message === "MAILGUN_NOT_CONFIGURED") {
        return jsonError(
          "Email verification is temporarily unavailable. Please try again later.",
          503
        );
      }

      console.error("Verification email error:", error);
      return jsonError(
        "Account created but we could not send the verification email. Please try again.",
        503
      );
    }

    return jsonOk({ email, needsVerification: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
