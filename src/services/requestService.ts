import { supabase } from "@/lib/supabase";

export interface RequestResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Creates a new stay request for a user if one does not already exist.
 *
 * @param roomId ID of the room being requested
 * @param userId ID of the user requesting the room
 * @returns Object indicating success status, and data or error string
 */
export async function createRequest(
  roomId: string,
  userId: string
): Promise<RequestResponse> {
  try {
    // Check if the request already exists for this room and user.
    const { data: existingRequest, error: fetchError } = await supabase
      .from("requests")
      .select("id")
      .eq("room_id", roomId)
      .eq("user_id", userId) 
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing request:", fetchError);
      return {
        success: false,
        error: "Failed to verify existing requests.",
      };
    }

    if (existingRequest) {
      return {
        success: false,
        error: "Request already exists",
      };
    }

    // Insert the new request
    const { data, error: insertError } = await supabase
      .from("requests")
      .insert([
        {
          room_id: roomId,
          user_id: userId,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating request:", insertError);
      return {
        success: false,
        error: insertError.message || "Failed to create request.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Unexpected error in createRequest:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

/**
 * Fetches all stay requests for rooms owned by the given host.
 *
 * @param ownerId ID of the host
 * @returns Array of requests with related room and student info
 */
export async function getHostRequests(ownerId: string): Promise<RequestResponse> {
  try {
    // Joins the rooms table and filters entirely within the DB for performance.
    // Also joins `users` to fetch the student email.
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        rooms!inner(title, owner_id),
        users(email)
      `)
      .eq("rooms.owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching host requests:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch host requests.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Unexpected error in getHostRequests:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

/**
 * Updates the status of a specific stay request.
 *
 * @param requestId ID of the request to update
 * @param status New status ("accepted" | "rejected")
 * @returns Updated request mapping
 */
export async function updateRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
): Promise<RequestResponse> {
  try {
    const { data, error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("Error updating request status:", error);
      return {
        success: false,
        error: error.message || "Failed to update request status.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Unexpected error in updateRequestStatus:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}
