import { supabase } from "@/lib/supabase"

export const updateProfile = async ({
  fullName,
  phone,
}: {
  fullName: string
  phone?: string
}) => {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return {
      success: false,
      error: "User not authenticated",
    }
  }

  const user = userData.user

  // Basic validation
  if (!fullName || fullName.trim().length === 0) {
    return {
      success: false,
      error: "Full name is required",
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  return { success: true }
}
