import { db } from "@/lib/db";
import { formatApplicationSummary } from "@/lib/applications/summary";
import { formatRentTerm } from "@/lib/applications/effective";
import { getPortalReplyAddress } from "@/lib/mailgun";
import type { NotificationKey } from "@/lib/notifications/catalog";
import { isNotificationEnabled } from "@/lib/notifications/catalog";
import {
  portalEmailFooter,
  portalEmailHtmlFooter,
  portalLink,
  sendPortalEmail,
} from "@/lib/notifications/mail";
import type { UserRole } from "@prisma/client";

type EmailContent = {
  subject: string;
  text: string;
  html?: string;
};

async function getSubscribers(
  key: NotificationKey,
  roles: UserRole[],
  excludeUserIds: string[] = []
) {
  const users = await db.user.findMany({
    where: {
      role: { in: roles },
      status: "ACTIVE",
      ...(excludeUserIds.length > 0 ? { id: { notIn: excludeUserIds } } : {}),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailNotifications: true,
    },
  });

  return users.filter((user) =>
    isNotificationEnabled(user.role, user.emailNotifications, key)
  );
}

async function notifyUsers(
  key: NotificationKey,
  roles: UserRole[],
  buildEmail: (user: {
    email: string;
    firstName: string;
    lastName: string;
  }) => EmailContent,
  excludeUserIds: string[] = [],
  options?: { replyTo?: string }
) {
  const subscribers = await getSubscribers(key, roles, excludeUserIds);
  if (subscribers.length === 0) return;

  await Promise.allSettled(
    subscribers.map(async (user) => {
      const content = buildEmail(user);
      await sendPortalEmail({
        to: user.email,
        subject: content.subject,
        text: content.text + portalEmailFooter(),
        html: (content.html ?? content.text.replace(/\n/g, "<br>")) + portalEmailHtmlFooter(),
        replyTo: options?.replyTo,
      });
    })
  );
}

async function notifyUserById(
  userId: string,
  key: NotificationKey,
  buildEmail: (user: {
    email: string;
    firstName: string;
    lastName: string;
  }) => EmailContent
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailNotifications: true,
    },
  });

  if (!user || user.status !== "ACTIVE") return;
  if (!isNotificationEnabled(user.role, user.emailNotifications, key)) return;

  const content = buildEmail(user);
  await sendPortalEmail({
    to: user.email,
    subject: content.subject,
    text: content.text + portalEmailFooter(),
    html: (content.html ?? content.text.replace(/\n/g, "<br>")) + portalEmailHtmlFooter(),
  });
}

export async function notifyApplicationSubmitted(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      guest: { select: { firstName: true, lastName: true, email: true, phone: true } },
      desiredUnit: { select: { name: true } },
    },
  });
  if (!application) return;

  const details = formatApplicationSummary(application);

  await notifyUsers(
    "application_submitted",
    ["ADMIN", "STAFF"],
    () => ({
      subject: `New rental application — ${application.guest.firstName} ${application.guest.lastName}`,
      text: `A new rental application was submitted.\n\n${details}\n\nReview it in the portal:\n${portalLink("/portal/staff/applications")}`,
      html: `<p>A new rental application was submitted.</p><pre style="white-space:pre-wrap;font-family:inherit;">${details}</pre><p><a href="${portalLink("/portal/staff/applications")}">Review applications</a></p>`,
    }),
    [application.guestId]
  );
}

export async function notifyApplicationProposal(
  applicationId: string,
  token: string
) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      desiredUnit: { select: { name: true } },
      proposedUnit: { select: { name: true } },
    },
  });
  if (!application || !application.proposedUnit) return;

  const confirmLink = portalLink(
    `/portal/guest/applications/confirm?token=${encodeURIComponent(token)}`
  );
  const proposedRent = application.proposedMonthlyRent
    ? `$${Number(application.proposedMonthlyRent).toLocaleString()}`
    : "—";
  const proposedMoveIn = application.proposedMoveInDate
    ? application.proposedMoveInDate.toLocaleDateString()
    : "—";

  await notifyUserById(application.guest.id, "application_proposal", (user) => ({
    subject: `Please confirm your lease terms — ${application.proposedUnit?.name}`,
    text: `Hi ${user.firstName},

Our team proposed updated lease terms for your rental application:

Unit: ${application.proposedUnit?.name}
Move-in date: ${proposedMoveIn}
Rent: ${proposedRent} (${formatRentTerm(application.proposedRentTerm ?? "MONTHLY")})
${application.proposalNotes ? `\nNote from staff: ${application.proposalNotes}\n` : ""}
Please review and confirm these terms before we can finalize your application:

${confirmLink}

If something looks wrong, you can decline on that page and we'll follow up with you.`,
    html: `<p>Hi ${user.firstName},</p>
<p>Our team proposed updated lease terms for your rental application:</p>
<ul>
  <li><strong>Unit:</strong> ${application.proposedUnit?.name}</li>
  <li><strong>Move-in date:</strong> ${proposedMoveIn}</li>
  <li><strong>Rent:</strong> ${proposedRent} (${formatRentTerm(application.proposedRentTerm ?? "MONTHLY")})</li>
</ul>
${application.proposalNotes ? `<p><strong>Note from staff:</strong> ${application.proposalNotes}</p>` : ""}
<p><a href="${confirmLink}">Review and confirm lease terms</a></p>`,
  }));
}

export async function notifyApplicationProposalDeclined(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      guest: { select: { firstName: true, lastName: true, email: true } },
      desiredUnit: { select: { name: true } },
      proposedUnit: { select: { name: true } },
    },
  });
  if (!application) return;

  const unitName =
    application.proposedUnit?.name ?? application.desiredUnit?.name ?? "their application";

  await notifyUsers(
    "application_proposal_declined",
    ["ADMIN", "STAFF"],
    (user) => ({
      subject: `Lease proposal declined — ${unitName}`,
      text: `Hi ${user.firstName},

${application.guest.firstName} ${application.guest.lastName} (${application.guest.email}) declined the proposed lease terms for ${unitName}.

Review the application in the portal:
${portalLink("/portal/staff/applications")}`,
      html: `<p>Hi ${user.firstName},</p>
<p><strong>${application.guest.firstName} ${application.guest.lastName}</strong> (${application.guest.email}) declined the proposed lease terms for <strong>${unitName}</strong>.</p>
<p><a href="${portalLink("/portal/staff/applications")}">Review applications</a></p>`,
    })
  );
}

export async function notifyApplicationStatusChanged(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      desiredUnit: { select: { name: true } },
    },
  });
  if (!application) return;

  await notifyUserById(application.guestId, "application_status_changed", (user) => ({
    subject: `Application update — ${application.status.replace(/_/g, " ")}`,
    text: `Hi ${user.firstName},\n\nYour rental application${application.desiredUnit ? ` for ${application.desiredUnit.name}` : ""} was updated to: ${application.status.replace(/_/g, " ")}.${application.reviewNotes ? `\n\nStaff note: ${application.reviewNotes}` : ""}\n\nView your applications:\n${portalLink("/portal/guest/applications")}`,
  }));
}

export async function notifyApplicationApprovedWithLease(
  applicationId: string,
  leaseId: string
) {
  const [application, lease] = await Promise.all([
    db.application.findUnique({
      where: { id: applicationId },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        desiredUnit: { select: { name: true } },
      },
    }),
    db.lease.findUnique({
      where: { id: leaseId },
      include: { unit: { select: { name: true } } },
    }),
  ]);

  if (!application || !lease) return;

  const applicationSummary = formatApplicationSummary(application);
  const leaseLink = portalLink("/portal/resident/lease");
  const leaseDetails = [
    `Unit: ${lease.unit.name}`,
    `Monthly rent: $${Number(lease.monthlyRent).toLocaleString()}`,
    `Lease start: ${lease.startDate.toLocaleDateString()}`,
  ].join("\n");

  await notifyUserById(application.guest.id, "lease_created", (user) => ({
    subject: `Application approved — sign your lease for ${lease.unit.name}`,
    text: `Hi ${user.firstName},

Congratulations! Your rental application has been approved and your lease is ready to sign.

YOUR APPLICATION
----------------
${applicationSummary}

YOUR LEASE
----------
${leaseDetails}

NEXT STEP
---------
Please review and sign your lease in the resident portal:
${leaseLink}

Sign in with your existing portal account. After you sign electronically, your lease becomes active.`,
    html: `<p>Hi ${user.firstName},</p>
<p><strong>Congratulations!</strong> Your rental application has been approved and your lease is ready to sign.</p>
<h3>Your application</h3>
<pre style="white-space:pre-wrap;font-family:inherit;">${applicationSummary}</pre>
<h3>Your lease</h3>
<pre style="white-space:pre-wrap;font-family:inherit;">${leaseDetails}</pre>
<h3>Next step</h3>
<p>Please review and sign your lease in the resident portal:</p>
<p><a href="${leaseLink}">Sign your lease</a></p>
<p>Sign in with your existing portal account. After you sign electronically, your lease becomes active.</p>`,
  }));
}

export async function notifyMaintenanceSubmitted(requestId: string) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      resident: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  if (!request) return;

  const details = [
    `Resident: ${request.resident.firstName} ${request.resident.lastName}`,
    `Priority: ${request.priority}`,
    `Title: ${request.title}`,
    `Description: ${request.description}`,
  ].join("\n");

  await notifyUsers(
    "maintenance_submitted",
    ["ADMIN", "STAFF"],
    () => ({
      subject: `New maintenance request — ${request.title}`,
      text: `A new maintenance request was submitted.\n\n${details}\n\nReview it in the portal:\n${portalLink("/portal/staff/maintenance")}`,
    }),
    [request.residentId]
  );
}

export async function notifyMaintenanceStatusChanged(requestId: string) {
  const request = await db.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      resident: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!request) return;

  await notifyUserById(request.residentId, "maintenance_status_changed", (user) => ({
    subject: `Maintenance update — ${request.status.replace(/_/g, " ")}`,
    text: `Hi ${user.firstName},\n\nYour maintenance request "${request.title}" was updated to: ${request.status.replace(/_/g, " ")}.${request.staffNotes ? `\n\nStaff note: ${request.staffNotes}` : ""}\n\nView your requests:\n${portalLink("/portal/resident/maintenance")}`,
  }));
}

export async function notifyPortalMessageToStaff(
  messageId: string,
  senderId: string
) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      thread: { select: { id: true, subject: true } },
    },
  });
  if (!message) return;
  if (message.sender.role !== "GUEST" && message.sender.role !== "RESIDENT") {
    return;
  }

  const replyTo = getPortalReplyAddress(message.thread.id);
  const replyHint = replyTo
    ? `\n\nReply to this email to respond in the portal.`
    : "";

  await notifyUsers(
    "portal_message_to_staff",
    ["ADMIN", "STAFF"],
    () => ({
      subject: `New portal message — ${message.thread.subject}`,
      text: `${message.sender.firstName} ${message.sender.lastName} (${message.sender.role}) sent a message:\n\nSubject: ${message.thread.subject}\n\n${message.body}${replyHint}`,
      html: `<p><strong>${message.sender.firstName} ${message.sender.lastName}</strong> (${message.sender.role}) sent a message:</p><p><strong>Subject:</strong> ${message.thread.subject}</p><p style="white-space:pre-wrap;">${message.body}</p>${replyTo ? `<p><em>Reply to this email to respond in the portal.</em></p>` : ""}`,
    }),
    [senderId],
    { replyTo: replyTo ?? undefined }
  );
}

export async function notifyPortalMessageToUser(messageId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      thread: {
        select: {
          subject: true,
          participantId: true,
          participant: { select: { role: true } },
        },
      },
    },
  });
  if (!message) return;
  if (message.sender.role !== "ADMIN" && message.sender.role !== "STAFF") {
    return;
  }

  const participant = message.thread.participant;
  const key: NotificationKey = "portal_message_to_user";
  const path =
    participant.role === "RESIDENT"
      ? "/portal/resident/messages"
      : "/portal/guest/messages";

  await notifyUserById(message.thread.participantId, key, (user) => ({
    subject: `Reply from J&M Rentals — ${message.thread.subject}`,
    text: `Hi ${user.firstName},\n\nStaff replied to your message "${message.thread.subject}":\n\n${message.body}\n\nView the conversation:\n${portalLink(path)}`,
  }));
}

export async function notifyAnnouncementPosted(announcementId: string) {
  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
    include: {
      unit: { select: { name: true } },
      author: { select: { firstName: true, lastName: true } },
    },
  });
  if (!announcement) return;

  let recipientIds: string[] | undefined;

  if (announcement.unitId) {
    const leases = await db.lease.findMany({
      where: { unitId: announcement.unitId, status: "ACTIVE" },
      select: { residentId: true },
    });
    recipientIds = leases.map((lease) => lease.residentId);
  }

  const roles: UserRole[] = announcement.unitId ? ["RESIDENT"] : ["GUEST", "RESIDENT"];
  const subscribers = await getSubscribers("announcement_posted", roles);

  const filtered = announcement.unitId
    ? subscribers.filter((user) => recipientIds?.includes(user.id))
    : subscribers;

  if (filtered.length === 0) return;

  const unitLine = announcement.unit
    ? `Unit: ${announcement.unit.name}\n`
    : "";

  await Promise.allSettled(
    filtered.map(async (user) => {
      const path =
        user.role === "RESIDENT"
          ? "/portal/resident/community"
          : "/portal/guest";
      await sendPortalEmail({
        to: user.email,
        subject: `New announcement — ${announcement.title}`,
        text: `Hi ${user.firstName},\n\n${unitLine}${announcement.body}\n\nView in the portal:\n${portalLink(path)}` + portalEmailFooter(),
      });
    })
  );
}

export async function notifyPaymentRecorded(paymentId: string) {
  const payment = await db.paymentRecord.findUnique({
    where: { id: paymentId },
    include: {
      resident: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!payment) return;

  const paidLine = payment.paidAt
    ? `Paid on: ${payment.paidAt.toLocaleDateString()}`
    : "Status: Due";

  await notifyUserById(payment.residentId, "payment_recorded", (user) => ({
    subject: `Payment update — $${Number(payment.amount).toLocaleString()}`,
    text: `Hi ${user.firstName},\n\nA payment entry was added to your account:\n\n${payment.description}\nAmount: $${Number(payment.amount).toLocaleString()}\nDue: ${payment.dueDate.toLocaleDateString()}\n${paidLine}\n\nView payments:\n${portalLink("/portal/resident/payments")}`,
  }));
}

export async function notifyPaymentReceived(paymentId: string) {
  const payment = await db.paymentRecord.findUnique({
    where: { id: paymentId },
  });
  if (!payment || !payment.paidAt) return;

  const paidAt = payment.paidAt;
  await notifyUserById(payment.residentId, "payment_received", (user) => ({
    subject: `Payment received — $${Number(payment.amount).toLocaleString()}`,
    text: `Hi ${user.firstName},\n\nWe received your payment for ${payment.description}.\n\nAmount: $${Number(payment.amount).toLocaleString()}\nPaid on: ${paidAt.toLocaleDateString()}\n\nView your payment history:\n${portalLink("/portal/resident/payments")}`,
  }));
}

export async function notifyLeaseCreated(
  residentId: string,
  unitName: string,
  monthlyRent: number
) {
  await notifyUserById(residentId, "lease_created", (user) => ({
    subject: `Your lease is ready — ${unitName}`,
    text: `Hi ${user.firstName},\n\nA lease has been created for ${unitName} at $${monthlyRent.toLocaleString()}/month.\n\nReview and sign your lease in the portal:\n${portalLink("/portal/resident/lease")}`,
  }));
}

export async function notifyLeaseSigned(leaseId: string) {
  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: {
      resident: { select: { firstName: true, lastName: true } },
      unit: { select: { name: true } },
    },
  });
  if (!lease) return;

  await notifyUsers(
    "lease_signed",
    ["ADMIN", "STAFF"],
    () => ({
      subject: `Lease signed — ${lease.resident.firstName} ${lease.resident.lastName}`,
      text: `${lease.resident.firstName} ${lease.resident.lastName} signed the lease for ${lease.unit.name}.\n\nSigned by: ${lease.signedByName ?? "Resident"}\nSigned on: ${lease.signedAt?.toLocaleString() ?? "Unknown"}\n\nManage leases:\n${portalLink("/portal/admin/leases")}`,
    }),
    [lease.residentId]
  );
}

export async function dispatchPortalNotification(
  task: () => Promise<void>
) {
  try {
    const { isFeatureEnabled: featureEnabled } = await import(
      "@/lib/settings/store"
    );
    if (!(await featureEnabled("emailNotifications"))) {
      return;
    }
    await task();
  } catch (error) {
    console.error("Portal notification error:", error);
  }
}
