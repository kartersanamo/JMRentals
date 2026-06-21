import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  firstName: z.string().min(1, "First name required").max(80),
  lastName: z.string().min(1, "Last name required").max(80),
  phone: z.string().max(30).optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Valid email required"),
  code: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const applicationSchema = z.object({
  desiredUnitId: z.string().optional(),
  moveInDate: z.string().optional(),
  employmentInfo: z.string().min(10, "Please provide employment details").max(2000),
  additionalNotes: z.string().max(2000).optional(),
});

export const maintenanceSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const profileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(30).optional(),
  emergencyName: z.string().max(120).optional(),
  emergencyPhone: z.string().max(30).optional(),
  vehicles: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forcedPasswordChangeSchema = z
  .object({
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(30).optional(),
  role: z.enum(["ADMIN", "STAFF", "RESIDENT", "GUEST"]),
});

export const unitSchema = z.object({
  name: z.string().min(1).max(120),
  beds: z.string().min(1).max(40),
  baths: z.string().min(1).max(40),
  description: z.string().min(1).max(2000),
  monthlyRent: z.coerce.number().positive(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
  address: z.string().max(200).optional(),
});

export const leaseSchema = z.object({
  residentId: z.string().min(1),
  unitId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().positive(),
  houseRules: z.string().max(5000).optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  unitId: z.string().optional(),
});

export const messageSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(5000),
  threadId: z.string().optional(),
});

export const paymentSchema = z.object({
  residentId: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  paidAt: z.string().optional(),
  description: z.string().min(1).max(500),
});

export const applicationReviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "DENIED"]),
  reviewNotes: z.string().max(2000).optional(),
});

export const checklistSchema = z.record(z.boolean());

export type RegisterInput = z.infer<typeof registerSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
