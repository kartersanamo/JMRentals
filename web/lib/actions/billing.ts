"use server";

import { createAuditLog } from "@/lib/audit";
import { auth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dispatchPortalNotification,
  notifyLeaseSigned,
  notifyPaymentReceived,
} from "@/lib/notifications/dispatch";
import { createRentCheckoutSession } from "@/lib/payments/stripe-checkout";
import { isFeatureEnabled } from "@/lib/settings/store";
import { saveUploadedFile, resolveStoredFilePath } from "@/lib/storage";
import {
  attachLeaseDocumentSchema,
  deleteDocumentSchema,
  documentUploadSchema,
  generateRentSchema,
  signLeaseSchema,
} from "@/lib/validators/billing";
import { unlink } from "fs/promises";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

function revalidatePortal() {
  revalidatePath("/portal", "layout");
}

export async function uploadDocument(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!(await isFeatureEnabled("documentManagement"))) {
    return { error: "Document management is currently disabled." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to upload." };
  }

  const parsed = documentUploadSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    residentId: formData.get("residentId") || undefined,
    unitId: formData.get("unitId") || undefined,
    leaseId: formData.get("leaseId") || undefined,
    isGlobal: formData.get("isGlobal") === "on" ? true : undefined,
  });
  if (!parsed.success) return { error: "Invalid document details." };

  try {
    const stored = await saveUploadedFile(file);
    await db.document.create({
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        residentId: parsed.data.residentId,
        unitId: parsed.data.unitId,
        leaseId: parsed.data.leaseId,
        isGlobal: parsed.data.isGlobal ?? false,
        filePath: stored.relativePath,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        uploadedById: session.user.id,
      },
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }

  if (session.user.role === "ADMIN") {
    await createAuditLog({
      actorId: session.user.id,
      action: "DOCUMENT_UPLOADED",
      targetType: "Document",
      details: parsed.data.title,
    });
  }

  revalidatePortal();
  return { success: true };
}

export async function deleteDocument(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!(await isFeatureEnabled("documentManagement"))) {
    return { error: "Document management is currently disabled." };
  }

  const parsed = deleteDocumentSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) return { error: "Invalid document." };

  const document = await db.document.findUnique({
    where: { id: parsed.data.id },
  });
  if (!document) return { error: "Document not found." };

  await db.lease.updateMany({
    where: { leaseDocumentId: document.id },
    data: { leaseDocumentId: null },
  });

  await db.document.delete({ where: { id: document.id } });

  try {
    await unlink(resolveStoredFilePath(document.filePath));
  } catch {
    // File may already be gone.
  }

  if (session.user.role === "ADMIN") {
    await createAuditLog({
      actorId: session.user.id,
      action: "DOCUMENT_DELETED",
      targetType: "Document",
      targetId: document.id,
      details: document.title,
    });
  }

  revalidatePortal();
  return { success: true };
}

export async function attachLeaseDocument(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  if (!(await isFeatureEnabled("leaseSigning"))) {
    return { error: "Lease signing is currently disabled." };
  }

  const parsed = attachLeaseDocumentSchema.safeParse({
    leaseId: formData.get("leaseId"),
    documentId: formData.get("documentId"),
  });
  if (!parsed.success) return { error: "Invalid lease document selection." };

  const [lease, document] = await Promise.all([
    db.lease.findUnique({ where: { id: parsed.data.leaseId } }),
    db.document.findUnique({ where: { id: parsed.data.documentId } }),
  ]);
  if (!lease) return { error: "Lease not found." };
  if (!document) return { error: "Document not found." };

  await db.$transaction([
    db.document.update({
      where: { id: document.id },
      data: {
        leaseId: lease.id,
        residentId: lease.residentId,
        unitId: lease.unitId,
        category: "LEASE",
      },
    }),
    db.lease.update({
      where: { id: lease.id },
      data: { leaseDocumentId: document.id },
    }),
  ]);

  revalidatePortal();
  return { success: true };
}

export async function signLease(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESIDENT") {
    return { error: "Unauthorized." };
  }
  if (!(await isFeatureEnabled("leaseSigning"))) {
    return { error: "Lease signing is currently disabled." };
  }

  const parsed = signLeaseSchema.safeParse({
    leaseId: formData.get("leaseId"),
    signedByName: formData.get("signedByName"),
    agree: formData.get("agree") === "on",
  });
  if (!parsed.success) return { error: "Please enter your full legal name and accept the lease terms." };

  const lease = await db.lease.findFirst({
    where: {
      id: parsed.data.leaseId,
      residentId: session.user.id,
      status: "PENDING",
    },
    include: { unit: { select: { name: true } } },
  });
  if (!lease) return { error: "Lease not found or already signed." };

  const requestHeaders = await headers();
  const signedIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";

  await db.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id: lease.id },
      data: {
        status: "ACTIVE",
        signedAt: new Date(),
        signedByName: parsed.data.signedByName,
        signedIp,
      },
    });

    const profile = await tx.residentProfile.findUnique({
      where: { userId: session.user.id },
      select: { checklistProgress: true },
    });
    if (profile?.checklistProgress && typeof profile.checklistProgress === "object") {
      const progress = {
        ...(profile.checklistProgress as Record<string, boolean>),
        "Signed lease received": true,
      };
      await tx.residentProfile.update({
        where: { userId: session.user.id },
        data: { checklistProgress: progress },
      });
    }
  });

  await dispatchPortalNotification(() => notifyLeaseSigned(lease.id));
  revalidatePortal();
  return { success: true };
}

export async function startRentCheckout(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESIDENT") {
    return { error: "Unauthorized." };
  }
  if (!(await isFeatureEnabled("onlineRentPayments"))) {
    return { error: "Online rent payments are currently disabled." };
  }

  const paymentId = formData.get("paymentId");
  const payAll = formData.get("payAll") === "true";

  let paymentIds: string[] = [];
  if (payAll) {
    const unpaid = await db.paymentRecord.findMany({
      where: { residentId: session.user.id, paidAt: null },
      select: { id: true },
    });
    paymentIds = unpaid.map((payment) => payment.id);
  } else if (typeof paymentId === "string" && paymentId.length > 0) {
    paymentIds = [paymentId];
  } else {
    return { error: "Select a charge to pay." };
  }

  const result = await createRentCheckoutSession(session.user.id, paymentIds);
  if ("error" in result) return { error: result.error };
  return { success: true, url: result.url };
}

export async function generateMonthlyRent(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!(await isFeatureEnabled("onlineRentPayments"))) {
    return { error: "Rent billing is currently disabled." };
  }

  const parsed = generateRentSchema.safeParse({
    billingMonth: formData.get("billingMonth"),
  });
  if (!parsed.success) return { error: "Choose a billing month." };

  const [year, month] = parsed.data.billingMonth.split("-").map(Number);
  const dueDate = new Date(year, month - 1, 1);
  const monthLabel = dueDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const leases = await db.lease.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, residentId: true, monthlyRent: true },
  });

  let created = 0;
  for (const lease of leases) {
    const description = `${monthLabel} Rent`;
    const existing = await db.paymentRecord.findFirst({
      where: {
        residentId: lease.residentId,
        leaseId: lease.id,
        description,
      },
    });
    if (existing) continue;

    await db.paymentRecord.create({
      data: {
        residentId: lease.residentId,
        leaseId: lease.id,
        amount: lease.monthlyRent,
        dueDate,
        description,
      },
    });
    created += 1;
  }

  if (session.user.role === "ADMIN") {
    await createAuditLog({
      actorId: session.user.id,
      action: "RENT_CHARGES_GENERATED",
      details: `${monthLabel}: ${created} charge(s)`,
    });
  }

  revalidatePortal();
  return { success: true, created };
}

export async function markPaymentPaidManually(formData: FormData) {
  await requireRole(["ADMIN", "STAFF"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Invalid payment." };

  const payment = await db.paymentRecord.findUnique({ where: { id } });
  if (!payment) return { error: "Payment not found." };
  if (payment.paidAt) return { error: "Payment is already marked paid." };

  await db.paymentRecord.update({
    where: { id },
    data: { paidAt: new Date() },
  });

  await dispatchPortalNotification(() => notifyPaymentReceived(id));
  revalidatePortal();
  return { success: true };
}
