import { supabase } from "@/lib/supabase"

export const createStayRequest = async ({
  listingId,
  message,
  moveInDate,
  durationMonths,
}: {
  listingId: string
  message?: string
  moveInDate: string
  durationMonths: number
}) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Not logged in" }
  }

  const user = userData.user

  // Check existing active request
  const { data: existing } = await supabase
    .from("stay_requests")
    .select("id, status")
    .eq("guest_id", user.id)
    .eq("listing_id", listingId)
    .in("status", ["pending", "accepted"])
    .maybeSingle()

  if (existing) {
    return {
      success: false,
      error: "You already have an active request",
    }
  }

  // Get listing to fetch host_id
  const { data: listing } = await supabase
    .from("listings")
    .select("host_id")
    .eq("id", listingId)
    .single()

  const { error } = await supabase.from("stay_requests").insert({
    listing_id: listingId,
    guest_id: user.id,
    host_id: listing?.host_id,
    message,
    move_in_date: moveInDate,
    duration_months: durationMonths,
    status: "pending",
  })

  if (error) {
    console.error("Error creating request:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export const getStudentRequests = async () => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return []

  const { data, error } = await supabase
    .from("stay_requests")
    .select(
      `
      id, status, move_in_date, duration_months,
      message, created_at, rejection_reason,
      listings (
        id, title, locality, price_per_month,
        listing_images (url, is_primary)
      )
    `
    )
    .eq("guest_id", userData.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching requests:", error)
    return []
  }

  return data || []
}

export const cancelStayRequest = async (requestId: string) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Not logged in" }
  }

  const { error } = await supabase
    .from("stay_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("guest_id", userData.user.id) // 🔥 RLS-safe

  if (error) {
    console.error("Error cancelling request:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export const submitReview = async ({
  listingId,
  rating,
  comment,
}: {
  listingId: string
  rating: number
  comment: string
}) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { success: false, error: "Not logged in" }
  }

  const { error } = await supabase.from("reviews").insert({
    listing_id: listingId,
    guest_id: userData.user.id,
    rating,
    comment,
  })

  if (error) {
    console.error("Error submitting review:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
