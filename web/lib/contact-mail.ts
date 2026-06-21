import { getMailFromAddress, getMailgunClient } from "@/lib/mailgun";
import { getContactFormRecipientEmails } from "@/lib/notifications/recipients";

export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactFormEmail(
  payload: ContactFormPayload
): Promise<void> {
  const mailgun = getMailgunClient();
  const from = getMailFromAddress();
  const domain = process.env.MAILGUN_DOMAIN;
  const recipients = await getContactFormRecipientEmails();

  if (!mailgun || !from || !domain) {
    throw new Error("MAILGUN_NOT_CONFIGURED");
  }

  if (recipients.length === 0) {
    throw new Error("NO_CONTACT_RECIPIENTS");
  }

  const fullName = `${payload.firstName} ${payload.lastName}`;
  const phoneLine = payload.phone ? `\nPhone: ${payload.phone}` : "";

  await mailgun.messages.create(domain, {
    from,
    to: recipients,
    subject: `New inquiry from ${fullName} — J&M Rentals`,
    text: `New contact form submission from the J&M Rentals website.

Name: ${fullName}
Email: ${payload.email}${phoneLine}

Message:
${payload.message}
`,
    html: `
<p>New contact form submission from the J&amp;M Rentals website.</p>
<p><strong>Name:</strong> ${fullName}<br>
<strong>Email:</strong> ${payload.email}${payload.phone ? `<br><strong>Phone:</strong> ${payload.phone}` : ""}</p>
<p><strong>Message:</strong></p>
<p style="white-space:pre-wrap;">${payload.message}</p>
`,
    "h:Reply-To": payload.email,
  });
}
