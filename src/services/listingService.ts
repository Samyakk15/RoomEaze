import { supabase } from "@/lib/supabase"

export const getListings = async ({
  locality,
  type,
  minPrice,
  maxPrice,
  furnished,
  gender,
  page = 1,
}: {
  locality?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  furnished?: boolean
  gender?: string
  page?: number
}) => {
  let query = supabase
    .from("listings")
    .select(
      `
      id, title, locality, price_per_month, security_deposit,
      type, is_furnished, gender_preference, max_occupancy,
      available_from, status, created_at,
      listing_images (url, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Apply filters
  if (locality) query = query.eq("locality", locality)
  if (type) query = query.eq("type", type)
  if (minPrice) query = query.gte("price_per_month", minPrice)
  if (maxPrice) query = query.lte("price_per_month", maxPrice)
  if (furnished !== undefined) query = query.eq("is_furnished", furnished)
  if (gender) query = query.eq("gender_preference", gender)

  // Pagination (12 per page)
  const from = (page - 1) * 12
  const to = from + 11
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching listings:", error)
    return { listings: [], count: 0 }
  }

  return { listings: data || [], count: count || 0 }
}

export const getListingById = async (listingId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_images (id, url, is_primary),
      amenities (id, name),
      profiles (id, full_name, phone, created_at)
    `
    )
    .eq("id", listingId)
    .eq("status", "active")
    .single()

  if (error) {
    console.error("Error fetching listing:", error)
    return null
  }

  return data
}

export const getListingReviews = async (listingId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      profiles (full_name)
    `
    )
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return data || []
}

export const getListingRating = async (listingId: string) => {
  const { data, error } = await supabase.rpc(
    "get_listing_rating",
    { p_listing_id: listingId }
  )

  if (error) {
    console.error("Error fetching rating:", error)
    return null
  }

  return data
}

export const getFeaturedListings = async () => {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id, title, locality, price_per_month,
      type, is_furnished, gender_preference,
      listing_images (url, is_primary)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching featured listings:", error)
    return []
  }

  return data || []
}
