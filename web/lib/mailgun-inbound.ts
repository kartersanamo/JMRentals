import { createHmac, timingSafeEqual } from "crypto";
import { parsePortalReplyThreadId } from "@/lib/mailgun";

const WEBHOOK_MAX_AGE_SECONDS = 15 * 60;

export function verifyMailgunWebhookSignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY?.trim();
  if (!signingKey) {
    return process.env.NODE_ENV !== "production";
  }

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) return false;

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > WEBHOOK_MAX_AGE_SECONDS) return false;

  const digest = createHmac("sha256", signingKey)
    .update(timestamp + token)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function findPortalReplyThreadId(addresses: string[]): string | null {
  for (const address of addresses) {
    const threadId = parsePortalReplyThreadId(address);
    if (threadId) return threadId;
  }
  return null;
}

export function normalizeInboundMessageBody(
  strippedText: string | null,
  bodyPlain: string | null
): string | null {
  const primary = strippedText?.trim();
  if (primary) return primary;

  const fallback = bodyPlain?.trim();
  if (!fallback) return null;

  const withoutQuotes = fallback
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n")
    .replace(/\nOn .+ wrote:\n[\s\S]*$/i, "")
    .trim();

  return withoutQuotes || null;
}
