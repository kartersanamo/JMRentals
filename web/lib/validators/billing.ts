import { z } from "zod";

export const documentUploadSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(["LEASE", "ADDENDUM", "RULES", "RECEIPT", "OTHER"]),
  residentId: z.string().optional(),
  unitId: z.string().optional(),
  leaseId: z.string().optional(),
  isGlobal: z.boolean().optional(),
});

export const deleteDocumentSchema = z.object({
  id: z.string().min(1),
});

export const attachLeaseDocumentSchema = z.object({
  leaseId: z.string().min(1),
  documentId: z.string().min(1),
});

export const signLeaseSchema = z
  .object({
    leaseId: z.string().min(1),
    signedByName: z.string().min(2).max(120),
    agree: z.boolean(),
  })
  .refine((data) => data.agree, {
    message: "You must accept the lease terms.",
    path: ["agree"],
  });

export const generateRentSchema = z.object({
  billingMonth: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format"),
});

export const checkoutSchema = z.object({
  paymentId: z.string().optional(),
  payAll: z.boolean().optional(),
});
