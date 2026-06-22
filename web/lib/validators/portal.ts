import { z } from "zod";
import {
  emailFieldSchema,
  newPasswordsMatchRefine,
  optionalPhoneFieldSchema,
  passwordMatchMessage,
  passwordsMatchRefine,
  strongPasswordSchema,
} from "@/lib/validators/fields";

export const registerSchema = z
  .object({
    email: emailFieldSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(1, "First name required").max(80),
    lastName: z.string().min(1, "Last name required").max(80),
    phone: optionalPhoneFieldSchema,
  })
  .refine((data) => passwordsMatchRefine(data), {
    message: passwordMatchMessage,
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  email: emailFieldSchema,
  code: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const resendVerificationSchema = z.object({
  email: emailFieldSchema,
});

export const loginSchema = z.object({
  email: emailFieldSchema,
  password: z.string().min(1, "Password is required"),
});

export const previousJobSchema = z.object({
  employer: z.string().min(1, "Employer name required").max(120),
  position: z.string().min(1, "Position required").max(120),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
});

export const employmentDetailsSchema = z.object({
  currentEmployer: z.string().min(1, "Current employer required").max(120),
  currentPosition: z.string().min(1, "Current position required").max(120),
  employmentStartDate: z.string().min(1, "Employment start date required"),
  yearlyIncome: z.coerce
    .number({ invalid_type_error: "Enter a valid yearly income" })
    .positive("Yearly income must be greater than zero"),
  employerPhone: optionalPhoneFieldSchema,
  supervisorName: z.string().max(120).optional(),
  previousJobs: z.array(previousJobSchema).max(10),
});

export const applicationSchema = z.object({
  desiredUnitId: z.string().optional(),
  moveInDate: z.string().optional(),
  employmentDetails: employmentDetailsSchema,
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
  phone: optionalPhoneFieldSchema,
  emergencyName: z.string().max(120).optional(),
  emergencyPhone: optionalPhoneFieldSchema,
  vehicles: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => newPasswordsMatchRefine(data), {
    message: passwordMatchMessage,
    path: ["confirmPassword"],
  });

export const forcedPasswordChangeSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => newPasswordsMatchRefine(data), {
    message: passwordMatchMessage,
    path: ["confirmPassword"],
  });

export const createUserSchema = z
  .object({
    email: emailFieldSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm the password"),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    phone: optionalPhoneFieldSchema,
    role: z.enum(["ADMIN", "STAFF", "RESIDENT", "GUEST"]),
  })
  .refine((data) => passwordsMatchRefine(data), {
    message: passwordMatchMessage,
    path: ["confirmPassword"],
  });

export const unitSchema = z.object({
  name: z.string().min(1).max(120),
  beds: z.string().min(1).max(40),
  baths: z.string().min(1).max(40),
  description: z.string().min(1).max(2000),
  monthlyRent: z.coerce.number().positive(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
  address: z.string().max(200).optional(),
  imageUrl: z.string().max(500).optional(),
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
export type EmploymentDetails = z.infer<typeof employmentDetailsSchema>;
export type PreviousJob = z.infer<typeof previousJobSchema>;
