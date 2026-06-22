import { createStaffReplyFromEmail } from "@/lib/inbound-portal-message";
import {
  findPortalReplyThreadId,
  normalizeInboundMessageBody,
  verifyMailgunWebhookSignature,
} from "@/lib/mailgun-inbound";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function formValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const timestamp = formValue(formData, "timestamp");
    const token = formValue(formData, "token");
    const signature = formValue(formData, "signature");

    if (!timestamp || !token || !signature) {
      return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
    }

    if (!verifyMailgunWebhookSignature(timestamp, token, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const recipient = formValue(formData, "recipient");
    const to = formValue(formData, "To");
    const sender = formValue(formData, "sender") ?? formValue(formData, "from");
    const strippedText = formValue(formData, "stripped-text");
    const bodyPlain = formValue(formData, "body-plain");

    const threadId = findPortalReplyThreadId(
      [recipient, to].filter((value): value is string => Boolean(value))
    );
    if (!threadId) {
      console.warn("Mailgun inbound: ignored message without portal reply address");
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!sender) {
      console.warn("Mailgun inbound: missing sender for thread", threadId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const body = normalizeInboundMessageBody(strippedText, bodyPlain);
    if (!body) {
      console.warn("Mailgun inbound: empty reply body for thread", threadId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const result = await createStaffReplyFromEmail(threadId, sender, body);
    if (!result.ok) {
      console.warn(
        `Mailgun inbound: could not save reply for thread ${threadId}: ${result.reason}`
      );
      return NextResponse.json({ ok: true, ignored: true, reason: result.reason });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mailgun inbound webhook error:", error);
    return NextResponse.json({ error: "Failed to process inbound email." }, { status: 500 });
  }
}
