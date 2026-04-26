import { z } from "zod"

export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
) => {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
