import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export const createListing = async ({
  user,
  listingData,
  images,
  selectedAmenities,
}: any) => {
  // Step 1: Insert listing
  const { data: newListing, error } = await supabase
    .from("listings")
    .insert({
      host_id: user.id,
      ...listingData,
      status: "pending",
    })
    .select()
    .single()

  if (error || !newListing) {
    return { success: false, error: error?.message }
  }

  // Step 2: Upload images
  const uploadedImages = []

  for (const file of images) {
    const fileExt = file.name.split(".").pop()
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, file, { contentType: file.type })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath)

    uploadedImages.push(data.publicUrl)
  }

  // Step 3: Insert image rows
  await supabase.from("listing_images").insert(
    uploadedImages.map((url, index) => ({
      listing_id: newListing.id,
      url,
      is_primary: index === 0,
    }))
  )

  // Step 4: Insert amenities
  await supabase.from("amenities").insert(
    selectedAmenities.map((name: string) => ({
      listing_id: newListing.id,
      name,
    }))
  )

  return { success: true, listingId: newListing.id }
}

export const getHostListings = async (userId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, title, locality, type, price_per_month,
      status, rejection_reason, created_at,
      listing_images (url, is_primary)
    `)
    .eq("host_id", userId)
    .order("created_at", { ascending: false })

  if (error) return []

  return data || []
}

export const getListingForEdit = async (
  listingId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, listing_images(*), amenities(*)`)
    .eq("id", listingId)
    .eq("host_id", userId) // 🔥 ownership check
    .single()

  if (error || !data) return null

  return data
}

export const updateListing = async ({
  listingId,
  userId,
  updates,
  selectedAmenities,
}: any) => {
  const { error } = await supabase
    .from("listings")
    .update({
      ...updates,
      status: "pending",
      rejection_reason: null,
    })
    .eq("id", listingId)
    .eq("host_id", userId)

  if (error) return { success: false, error: error.message }

  // Replace amenities
  await supabase.from("amenities").delete().eq("listing_id", listingId)

  await supabase.from("amenities").insert(
    selectedAmenities.map((name: string) => ({
      listing_id: listingId,
      name,
    }))
  )

  return { success: true }
}

export const deleteListing = async (
  listingId: string,
  userId: string
) => {
  // Get images
  const { data: images } = await supabase
    .from("listing_images")
    .select("url")
    .eq("listing_id", listingId)

  const paths =
    images?.map((img) => {
      const url = new URL(img.url)
      return url.pathname.split("/object/public/listing-images/")[1]
    }) || []

  // Delete from storage
  if (paths.length > 0) {
    await supabase.storage.from("listing-images").remove(paths)
  }

  // Delete listing (cascade)
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("host_id", userId)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export const getHostRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from("stay_requests")
    .select(`
      id, status, move_in_date, duration_months,
      message, created_at, rejection_reason,
      profiles (full_name, phone, email),
      listings (id, title, locality)
    `)
    .eq("host_id", userId)
    .order("created_at", { ascending: false })

  if (error) return []

  return data || []
}

export const acceptRequest = async (
  requestId: string,
  userId: string
) => {
  return supabase
    .from("stay_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("host_id", userId)
}

export const rejectRequest = async (
  requestId: string,
  userId: string,
  reason: string
) => {
  return supabase
    .from("stay_requests")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", requestId)
    .eq("host_id", userId)
}

export const getHostStats = async (userId: string) => {
  const [listingsRes, requestsRes] = await Promise.all([
    supabase.from("listings").select("id, status").eq("host_id", userId),
    supabase.from("stay_requests").select("id, status").eq("host_id", userId),
  ])

  return {
    total: listingsRes.data?.length ?? 0,
    active:
      listingsRes.data?.filter((l) => l.status === "active").length ?? 0,
    pending:
      listingsRes.data?.filter((l) => l.status === "pending").length ?? 0,
    newRequests:
      requestsRes.data?.filter((r) => r.status === "pending").length ?? 0,
  }
}
