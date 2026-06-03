import { z } from "zod";

export const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(80, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(80, "Last name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(512, "Message must be 512 characters or less"),
  website: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
