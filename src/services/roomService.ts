import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

/**
 * Fetch all rooms, optionally filtered by city and type via search filters.
 * Returns an empty array on error.
 */
export interface RoomFilters {
  city?: string;
  type?: string;
  min_price?: string;
  max_price?: string;
  page?: string;
}

/**
 * Fetch all rooms, optionally filtered by city and type via search filters.
 * Implements pagination with a 6-item page size.
 */
export const getRooms = async () => {
  const { data, error } = await supabase
    .from("listings") // ✅ fixed
    .select(`
      id, title, locality, price_per_month,
      listing_images (url, is_primary)
    `)
    .eq("status", "active")

  if (error) {
    console.error("Error fetching rooms:", error.message)
    return []
  }

  return data || []
}
/**
 * Fetch a single room by its ID.
 * Returns null on error or if not found.
 */
export const getRoomById = async (id: string) => {
  const { data, error } = await supabase
    .from("listings") // ✅ fixed
    .select(`
      *,
      listing_images (url, is_primary)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching room:", error.message)
    return null
  }

  return data
}

/**
 * Fetch all rooms for a specific host, filtered by owner_id.
 * Returns an empty array on error.
 */
export const getHostRooms = async (ownerId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching host rooms:", error.message)
    return []
  }

  return data
}

/**
 * Create a new room with the authenticated host's owner_id.
 */
export const addRoom = async (roomData: any, ownerId: string) => {
  const payload = { ...roomData, owner_id: ownerId }

  const { data, error } = await supabase
    .from("listings")
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error("Error adding room:", error.message)
    return null
  }

  return data
}

/**
 * Update an existing room.
 */
export const updateRoom = async (id: string, roomData: any) => {
  const { data, error } = await supabase
    .from("listings")
    .update(roomData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating room (id: ${id}):`, error.message)
    return null
  }

  return data
}

/**
 * Delete a room by ID, handling associated storage assets securely first.
 */
export const deleteRoom = async (id: string) => {
  try {
    // 1. Fetch room to extract attached Storage assets mapping
    const { data: room, error: fetchError } = await supabase
      .from("listings")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching room details for deletion:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    // 2. Delete linked image from Supabase Storage securely
    const imageUrl = room?.image_url;
    if (imageUrl && imageUrl.includes("supabase.co/storage")) {
      try {
        const urlObj = new URL(imageUrl);
        // Extracts standard public URL paths: /object/public/bucketName/filePath
        const pathParts = urlObj.pathname.split("/public/rooms/");
        if (pathParts.length === 2) {
          const filePath = pathParts[1];
          const { error: storageError } = await supabase.storage
            .from("listings")
            .remove([filePath]);

          if (storageError) {
            console.error("Storage delete failed:", storageError.message);
            return { success: false, error: "Failed to cleanly remove associated image." };
          }
        }
      } catch (err) {
        console.error("Failed to parse or remove URL from storage", err);
      }
    }

    // 3. Clear the database record securely
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(`Error deleting room database record (id: ${id}):`, deleteError.message);
      return { success: false, error: "Failed to delete room record natively." };
    }

    return { success: true };
  } catch (err) {
    console.error("Critical error inside sequence delete logic:", err);
    return { success: false, error: "An unexpected error occurred during sequence termination." };
  }
};
