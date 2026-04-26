import { z } from "zod"

export const listingSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title too long"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description too long")
    .optional(),

  type: z.enum(["pg", "room", "flat", "hostel"]),

  address: z.string().min(5, "Address is required"),

  city: z.string().min(2, "City is required"),

  locality: z.string().optional(),

  price_per_month: z
    .number({ message: "Price must be a number" })
    .min(500, "Price must be at least ₹500"),

  security_deposit: z
    .number()
    .min(0)
    .default(0),

  available_from: z.string().optional(),

  is_furnished: z.boolean().default(false),

  gender_preference: z
    .enum(["male", "female", "any"])
    .default("any"),

  max_occupancy: z
    .number()
    .min(1)
    .max(10)
    .default(1),
})

export const stayRequestSchema = z.object({
  message: z
    .string()
    .min(10, "Please write a short message to the host")
    .max(500, "Message too long")
    .optional(),

  move_in_date: z
    .string()
    .min(1, "Move-in date is required"),

  duration_months: z
    .number()
    .min(1, "Minimum 1 month")
    .max(24, "Maximum 24 months")
    .default(1),
})

export type ListingInput = z.infer<typeof listingSchema>
export type StayRequestInput = z.infer<typeof stayRequestSchema>
