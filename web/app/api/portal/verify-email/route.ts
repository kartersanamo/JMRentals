import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { db } from "@/lib/db";
import { verifyVerificationCode } from "@/lib/email-verification";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { verifyEmailSchema } from "@/lib/validators/portal";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid verification data.", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const ip = getClientIp(request);
    if (!checkRateLimit(`verify-email:${email}:${ip}`, 10)) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.role !== "GUEST") {
      return jsonError("Invalid verification code.", 400);
    }

    if (user.emailVerifiedAt) {
      return jsonOk({ verified: true, alreadyVerified: true });
    }

    if (
      !user.emailVerifyCodeHash ||
      !user.emailVerifyExpires ||
      user.emailVerifyExpires < new Date()
    ) {
      return jsonError("Verification code expired. Request a new code.", 400);
    }

    const valid = await verifyVerificationCode(
      parsed.data.code,
      user.emailVerifyCodeHash
    );
    if (!valid) {
      return jsonError("Invalid verification code.", 400);
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerifyCodeHash: null,
        emailVerifyExpires: null,
      },
    });

    return jsonOk({ verified: true });
  } catch (error) {
    return handleApiError(error);
  }
}
