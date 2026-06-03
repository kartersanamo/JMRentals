import { getContactEmailConfig, getMailgunClient } from "@/lib/mailgun";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validators/contact";
import { NextRequest, NextResponse } from "next/server";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  try {
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

    const mailgun = getMailgunClient();
    const config = getContactEmailConfig();

    if (!mailgun || !config) {
      console.error("Mailgun is not configured");
      return NextResponse.json(
        {
          error:
            "Contact form is temporarily unavailable. Please call or email us directly.",
        },
        { status: 503 }
      );
    }

    const fullName = `${firstName} ${lastName}`;
    const phoneLine = phone ? `\nPhone: ${phone}` : "";

    await mailgun.messages.create(config.domain, {
      from: config.from,
      to: [config.to],
      subject: `New inquiry from ${fullName} — J&M Rentals`,
      text: `New contact form submission from the J&M Rentals website.

Name: ${fullName}
Email: ${email}${phoneLine}

Message:
${message}
`,
      "h:Reply-To": email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
