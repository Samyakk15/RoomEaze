import { z } from "zod"

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),

  role: z.enum(["guest", "host"], {
    error: "Please select a role",
  }),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z.string().min(1, "Password is required"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
