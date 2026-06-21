import { getMailFromAddress, getMailgunClient } from "@/lib/mailgun";

export interface PortalEmailPayload {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export async function sendPortalEmail(
  payload: PortalEmailPayload
): Promise<void> {
  const mailgun = getMailgunClient();
  const from = getMailFromAddress();
  const domain = process.env.MAILGUN_DOMAIN;

  if (!mailgun || !from || !domain) {
    throw new Error("MAILGUN_NOT_CONFIGURED");
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

  await mailgun.messages.create(domain, {
    from,
    to: recipients,
    subject: payload.subject,
    text: payload.text,
    html: payload.html ?? payload.text.replace(/\n/g, "<br>"),
  });
}

export function getPortalBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function portalLink(path: string): string {
  return `${getPortalBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function portalEmailFooter(): string {
  return `\n\n— J&M Rentals Portal\nManage notifications: ${portalLink("/portal/notifications")}`;
}

export function portalEmailHtmlFooter(): string {
  return `<p style="margin-top:24px;color:#666;font-size:13px;">— J&M Rentals Portal<br><a href="${portalLink("/portal/notifications")}">Manage email notifications</a></p>`;
}
