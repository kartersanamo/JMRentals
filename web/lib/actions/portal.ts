"use server";

import { createAuditLog } from "@/lib/audit";
import { normalizeJsonString } from "@/lib/json";
import { auth, requireRole, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dispatchPortalNotification,
  notifyAnnouncementPosted,
  notifyApplicationStatusChanged,
  notifyApplicationSubmitted,
  notifyLeaseCreated,
  notifyMaintenanceStatusChanged,
  notifyMaintenanceSubmitted,
  notifyPaymentRecorded,
  notifyPaymentReceived,
  notifyPortalMessageToStaff,
  notifyPortalMessageToUser,
} from "@/lib/notifications/dispatch";
import {
  getNotificationsForRole,
  type NotificationPreferences,
} from "@/lib/notifications/catalog";
import { isFeatureEnabled } from "@/lib/settings/store";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  announcementSchema,
  applicationReviewSchema,
  applicationSchema,
  changePasswordSchema,
  forcedPasswordChangeSchema,
  checklistSchema,
  createUserSchema,
  leaseSchema,
  maintenanceSchema,
  messageSchema,
  paymentSchema,
  profileSchema,
  unitSchema,
} from "@/lib/validators/portal";
import { revalidatePath } from "next/cache";

function revalidatePortal() {
  revalidatePath("/portal", "layout");
}

export async function submitApplication(formData: FormData) {
  const session = await requireRole("GUEST");
  if (!(await isFeatureEnabled("portalGuestApply"))) {
    return { error: "Rental applications are currently disabled." };
  }

  let employmentDetails: unknown;
  try {
    employmentDetails = JSON.parse(String(formData.get("employmentDetails")));
  } catch {
    return { error: "Invalid employment data." };
  }

  const parsed = applicationSchema.safeParse({
    desiredUnitId: formData.get("desiredUnitId") || undefined,
    moveInDate: formData.get("moveInDate") || undefined,
    employmentDetails,
    additionalNotes: formData.get("additionalNotes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid application data." };

  const application = await db.application.create({
    data: {
      guestId: session.user.id,
      desiredUnitId: parsed.data.desiredUnitId,
      moveInDate: parsed.data.moveInDate
        ? new Date(parsed.data.moveInDate)
        : undefined,
      employmentDetails: parsed.data.employmentDetails,
      additionalNotes: parsed.data.additionalNotes,
    },
  });
  await dispatchPortalNotification(() =>
    notifyApplicationSubmitted(application.id)
  );
  revalidatePortal();
  return { success: true };
}

export async function reviewApplication(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id"));
  const parsed = applicationReviewSchema.safeParse({
    status: formData.get("status"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid review data." };

  await db.application.update({
    where: { id },
    data: parsed.data,
  });
  await dispatchPortalNotification(() =>
    notifyApplicationStatusChanged(id)
  );
  revalidatePortal();
  return { success: true };
}

export async function createLease(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  const parsed = leaseSchema.safeParse({
    residentId: formData.get("residentId"),
    unitId: formData.get("unitId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    monthlyRent: formData.get("monthlyRent"),
    houseRules: formData.get("houseRules") || undefined,
  });
  if (!parsed.success) return { error: "Invalid lease data." };

  const resident = await db.user.findUnique({
    where: { id: parsed.data.residentId },
  });
  if (!resident) return { error: "Resident not found." };

  await db.$transaction(async (tx) => {
    await tx.lease.create({
      data: {
        residentId: parsed.data.residentId,
        unitId: parsed.data.unitId,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        monthlyRent: parsed.data.monthlyRent,
        houseRules: parsed.data.houseRules,
        status: "PENDING",
      },
    });
    await tx.unit.update({
      where: { id: parsed.data.unitId },
      data: { status: "OCCUPIED" },
    });
    await tx.user.update({
      where: { id: parsed.data.residentId },
      data: { role: "RESIDENT" },
    });
    await tx.residentProfile.upsert({
      where: { userId: parsed.data.residentId },
      create: {
        userId: parsed.data.residentId,
        checklistProgress: await getDefaultChecklist(),
      },
      update: {},
    });
  });

  if (session.user.role === "ADMIN") {
    await createAuditLog({
      actorId: session.user.id,
      action: "LEASE_CREATED",
      targetType: "User",
      targetId: parsed.data.residentId,
      details: `Unit ${parsed.data.unitId}`,
    });
  }

  const unit = await db.unit.findUnique({
    where: { id: parsed.data.unitId },
    select: { name: true },
  });
  await dispatchPortalNotification(() =>
    notifyLeaseCreated(
      parsed.data.residentId,
      unit?.name ?? "your unit",
      Number(parsed.data.monthlyRent)
    )
  );

  revalidatePortal();
  return { success: true };
}

async function getDefaultChecklist() {
  const setting = await db.portalSetting.findUnique({
    where: { key: "default_checklist" },
  });
  if (!setting) return {};
  try {
    return JSON.parse(setting.value);
  } catch {
    return {};
  }
}

export async function createUserAccount(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Invalid user data." };

  if (parsed.data.role === "ADMIN" || parsed.data.role === "STAFF") {
    // only admin can create staff/admin - already enforced
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "Email already in use." };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      role: parsed.data.role,
      createdById: session.user.id,
      mustChangePassword: true,
      emailVerifiedAt: new Date(),
      residentProfile:
        parsed.data.role === "RESIDENT"
          ? { create: { checklistProgress: await getDefaultChecklist() } }
          : undefined,
    },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "USER_CREATED",
    targetType: "User",
    targetId: user.id,
    details: `Role: ${parsed.data.role}`,
  });

  revalidatePortal();
  return { success: true };
}

export async function updateUserStatus(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as "ACTIVE" | "DISABLED";

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return { error: "User not found." };
  if (session.user.role === "STAFF" && target.role !== "GUEST") {
    return { error: "Staff can only manage guest accounts." };
  }
  if (target.role === "ADMIN" && session.user.role !== "ADMIN") {
    return { error: "Forbidden." };
  }

  await db.user.update({ where: { id }, data: { status } });

  if (session.user.role === "ADMIN") {
    await createAuditLog({
      actorId: session.user.id,
      action: "USER_STATUS_UPDATED",
      targetType: "User",
      targetId: id,
      details: status,
    });
  }

  revalidatePortal();
  return { success: true };
}

export async function updateGuestNotes(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id"));
  const guestNotes = String(formData.get("guestNotes") ?? "");

  await db.user.update({
    where: { id, role: "GUEST" },
    data: { guestNotes },
  });
  revalidatePortal();
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
    emergencyName: formData.get("emergencyName") || undefined,
    emergencyPhone: formData.get("emergencyPhone") || undefined,
    vehicles: formData.get("vehicles") || undefined,
  });
  if (!parsed.success) return { error: "Invalid profile data." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
    },
  });

  if (session.user.role === "RESIDENT") {
    await db.residentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        emergencyName: parsed.data.emergencyName,
        emergencyPhone: parsed.data.emergencyPhone,
        vehicles: parsed.data.vehicles,
      },
      update: {
        emergencyName: parsed.data.emergencyName,
        emergencyPhone: parsed.data.emergencyPhone,
        vehicles: parsed.data.vehicles,
      },
    });
  }

  revalidatePortal();
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const usingTemporaryPassword = user.mustChangePassword;

  if (usingTemporaryPassword) {
    const parsed = forcedPasswordChangeSchema.safeParse({
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) return { error: "Invalid password data." };

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    revalidatePortal();
    await signOut({ redirectTo: "/login?passwordUpdated=1" });
    return { success: true };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: "Invalid password data." };

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  revalidatePortal();
  return { success: true };
}

export async function submitMaintenance(formData: FormData) {
  const session = await requireRole("RESIDENT");
  if (!(await isFeatureEnabled("maintenanceRequests"))) {
    return { error: "Maintenance requests are currently disabled." };
  }
  const parsed = maintenanceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority") || "MEDIUM",
  });
  if (!parsed.success) return { error: "Invalid maintenance request." };

  const request = await db.maintenanceRequest.create({
    data: {
      residentId: session.user.id,
      ...parsed.data,
    },
  });
  await dispatchPortalNotification(() =>
    notifyMaintenanceSubmitted(request.id)
  );
  revalidatePortal();
  return { success: true };
}

export async function updateMaintenance(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const staffNotes = String(formData.get("staffNotes") ?? "");

  await db.maintenanceRequest.update({
    where: { id },
    data: { status: status as never, staffNotes },
  });
  await dispatchPortalNotification(() =>
    notifyMaintenanceStatusChanged(id)
  );
  revalidatePortal();
  return { success: true };
}

export async function createAnnouncement(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    unitId: formData.get("unitId") || undefined,
  });
  if (!parsed.success) return { error: "Invalid announcement." };

  const announcement = await db.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      unitId: parsed.data.unitId,
      authorId: session.user.id,
    },
  });
  await dispatchPortalNotification(() =>
    notifyAnnouncementPosted(announcement.id)
  );
  revalidatePortal();
  return { success: true };
}

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };
  if (!(await isFeatureEnabled("portalMessages"))) {
    return { error: "Portal messaging is currently disabled." };
  }

  const parsed = messageSchema.safeParse({
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
    threadId: formData.get("threadId") || undefined,
  });
  if (!parsed.success) return { error: "Invalid message." };

  let threadId = parsed.data.threadId;
  if (!threadId) {
    const thread = await db.messageThread.create({
      data: {
        participantId: session.user.id,
        subject: parsed.data.subject ?? "General inquiry",
      },
    });
    threadId = thread.id;
  }

  const message = await db.message.create({
    data: {
      threadId,
      senderId: session.user.id,
      body: parsed.data.body,
    },
  });

  await dispatchPortalNotification(async () => {
    if (
      session.user.role === "GUEST" ||
      session.user.role === "RESIDENT"
    ) {
      await notifyPortalMessageToStaff(message.id, session.user.id);
    } else {
      await notifyPortalMessageToUser(message.id);
    }
  });

  revalidatePortal();
  return { success: true, threadId };
}

export async function createPaymentRecord(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  const parsed = paymentSchema.safeParse({
    residentId: formData.get("residentId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    paidAt: formData.get("paidAt") || undefined,
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Invalid payment data." };

  const activeLease = await db.lease.findFirst({
    where: {
      residentId: parsed.data.residentId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  const payment = await db.paymentRecord.create({
    data: {
      residentId: parsed.data.residentId,
      leaseId: activeLease?.id,
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : null,
      description: parsed.data.description,
    },
  });
  await dispatchPortalNotification(async () => {
    await notifyPaymentRecorded(payment.id);
    if (payment.paidAt) {
      await notifyPaymentReceived(payment.id);
    }
  });
  revalidatePortal();
  return { success: true };
}

export async function upsertUnit(formData: FormData) {
  await requireRole("ADMIN");
  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const parsed = unitSchema.safeParse({
    name: formData.get("name"),
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    description: formData.get("description"),
    monthlyRent: formData.get("monthlyRent"),
    status: formData.get("status"),
    address: formData.get("address") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });
  if (!parsed.success) return { error: "Invalid unit data." };

  if (id) {
    await db.unit.update({ where: { id }, data: parsed.data });
  } else {
    await db.unit.create({ data: parsed.data });
  }
  revalidatePortal();
  return { success: true };
}

export async function updatePortalSetting(formData: FormData) {
  const session = await requireRole("ADMIN");
  const key = String(formData.get("key"));
  const raw = String(formData.get("value"));

  const parsed = normalizeJsonString(raw);
  if (!parsed.ok) return { error: parsed.error };

  await db.portalSetting.upsert({
    where: { key },
    create: { key, value: parsed.value },
    update: { value: parsed.value },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "SETTING_UPDATED",
    targetType: "PortalSetting",
    details: key,
  });

  revalidatePortal();
  return { success: true };
}

export async function updateChecklist(formData: FormData) {
  const session = await requireRole("RESIDENT");
  const raw = formData.get("checklist");
  if (!raw) return { error: "Missing checklist." };

  let checklist: Record<string, boolean>;
  try {
    checklist = checklistSchema.parse(JSON.parse(String(raw)));
  } catch {
    return { error: "Invalid checklist." };
  }

  await db.residentProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, checklistProgress: checklist },
    update: { checklistProgress: checklist },
  });
  revalidatePortal();
  return { success: true };
}

export async function changeUserRole(formData: FormData) {
  const session = await requireRole("ADMIN");
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as "ADMIN" | "STAFF" | "RESIDENT" | "GUEST";

  await db.user.update({ where: { id }, data: { role } });

  if (role === "RESIDENT") {
    await db.residentProfile.upsert({
      where: { userId: id },
      create: { userId: id, checklistProgress: await getDefaultChecklist() },
      update: {},
    });
  }

  await createAuditLog({
    actorId: session.user.id,
    action: "ROLE_CHANGED",
    targetType: "User",
    targetId: id,
    details: role,
  });

  revalidatePortal();
  return { success: true };
}

export async function updateNotificationPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("preferences")));
  } catch {
    return { error: "Invalid preferences." };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Invalid preferences." };
  }

  const allowed = getNotificationsForRole(session.user.role);
  const preferences: NotificationPreferences = {};
  for (const item of allowed) {
    const value = (raw as Record<string, unknown>)[item.key];
    if (typeof value === "boolean") {
      preferences[item.key] = value;
    } else {
      preferences[item.key] = item.defaultEnabled;
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { emailNotifications: preferences },
  });

  revalidatePath("/portal/notifications");
  return { success: true };
}
