import { createAdminClient } from "@/lib/supabase/admin"

const adminSupabase = createAdminClient()

export const getAdminStats = async () => {
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingListings },
    { count: activeListings },
    { count: totalRequests },
    { count: newUsers },
  ] = await Promise.all([
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
    adminSupabase.from("listings").select("*", { count: "exact", head: true }),
    adminSupabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    adminSupabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    adminSupabase
      .from("stay_requests")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ])

  return {
    totalUsers: totalUsers || 0,
    totalListings: totalListings || 0,
    pendingListings: pendingListings || 0,
    activeListings: activeListings || 0,
    totalRequests: totalRequests || 0,
    newUsers: newUsers || 0,
  }
}

export const getPendingListings = async () => {
  const { data, error } = await adminSupabase
    .from("listings")
    .select(`
      *,
      listing_images (url, is_primary),
      amenities (name),
      profiles (full_name, email, phone, created_at)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) return []

  return data || []
}

export const approveListing = async (listingId: string) => {
  return adminSupabase
    .from("listings")
    .update({
      status: "active",
      rejection_reason: null,
    })
    .eq("id", listingId)
}

export const rejectListing = async (
  listingId: string,
  reason: string
) => {
  return adminSupabase
    .from("listings")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", listingId)
}

export const getAllListings = async (statusFilter?: string) => {
  let query = adminSupabase
    .from("listings")
    .select(`
      id, title, locality, type, price_per_month,
      status, rejection_reason, created_at,
      profiles (full_name, email),
      listing_images (url, is_primary)
    `)
    .order("created_at", { ascending: false })

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data, error } = await query

  if (error) return []

  return data || []
}

export const getAllUsers = async () => {
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return []

  return data || []
}

export const updateUserRole = async (
  userId: string,
  newRole: "guest" | "host",
  adminUserId: string
) => {
  return adminSupabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .neq("id", adminUserId) // cannot change self
    .in("role", ["guest", "host"]) // only allowed roles
}

export const adminDeleteListing = async (listingId: string) => {
  // Step 1: get image URLs
  const { data: images } = await adminSupabase
    .from("listing_images")
    .select("url")
    .eq("listing_id", listingId)

  const paths =
    images?.map((img) => {
      const url = new URL(img.url)
      return url.pathname.split("/object/public/listing-images/")[1]
    }) || []

  // Step 2: delete storage files
  if (paths.length > 0) {
    await adminSupabase.storage.from("listing-images").remove(paths)
  }

  // Step 3: delete listing row
  return adminSupabase.from("listings").delete().eq("id", listingId)
}
