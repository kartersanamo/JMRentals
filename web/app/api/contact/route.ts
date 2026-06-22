import { isFeatureEnabled } from "@/lib/settings/store";
import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/contact-mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { contactSchema } from "@/lib/validators/contact";

export async function POST(request: NextRequest) {
  try {
    if (!(await isFeatureEnabled("contactForm"))) {
      return NextResponse.json(
        { error: "The contact form is currently unavailable." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, message, website } =
      parsed.data;

    if (website && website.length > 0) {
      return NextResponse.json({ error: "Unable to process request." }, { status: 400 });
    }

    const limit = parseInt(
      process.env.CONTACT_RATE_LIMIT_PER_HOUR ?? "5",
      10
    );
    const ip = getClientIp(request);
    if (!checkRateLimit(`contact:${ip}`, limit)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    try {
      await sendContactFormEmail({
        firstName,
        lastName,
        email,
        phone,
        message,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "MAILGUN_NOT_CONFIGURED") {
        console.error("Contact form: Mailgun is not configured");
        return NextResponse.json(
          {
            error:
              "Contact form is temporarily unavailable. Please call or email us directly.",
          },
          { status: 503 }
        );
      }

      if (error instanceof Error && error.message === "NO_CONTACT_RECIPIENTS") {
        console.error(
          "Contact form: no recipients — enable Website contact form notifications for staff/admin or set CONTACT_TO_EMAIL"
        );
        return NextResponse.json(
          {
            error:
              "Contact form is temporarily unavailable. Please call or email us directly.",
          },
          { status: 503 }
        );
      }

      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
