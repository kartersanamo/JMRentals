import FormData from "form-data";
import Mailgun from "mailgun.js";

export function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return null;
  }

  const mailgun = new Mailgun(FormData);
  return mailgun.client({ username: "api", key: apiKey });
}

export function getMailFromAddress(): string | null {
  return process.env.MAILGUN_FROM ?? null;
}

export function getMailgunDomain(): string | null {
  return process.env.MAILGUN_DOMAIN?.trim() ?? null;
}

export function getPortalReplyAddress(threadId: string): string | null {
  const domain = getMailgunDomain();
  if (!domain) return null;
  return `portal+${threadId}@${domain}`;
}

const PORTAL_REPLY_LOCAL_PART = "portal+";

export function parsePortalReplyThreadId(address: string): string | null {
  const domain = getMailgunDomain();
  if (!domain) return null;

  const normalized = extractEmailAddress(address).toLowerCase();
  const suffix = `@${domain.toLowerCase()}`;
  if (!normalized.endsWith(suffix)) return null;

  const localPart = normalized.slice(0, -suffix.length);
  if (!localPart.startsWith(PORTAL_REPLY_LOCAL_PART)) return null;

  const threadId = localPart.slice(PORTAL_REPLY_LOCAL_PART.length);
  return threadId.length > 0 ? threadId : null;
}

export function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] ?? raw).trim();
}

export function getContactEmailConfig() {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.MAILGUN_FROM;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!to || !from || !domain) {
    return null;
  }

  return { to, from, domain };
}
