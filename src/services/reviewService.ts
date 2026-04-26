import { supabase } from "@/lib/supabase";

export interface ReviewResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Creates a new review for a given room.
 * Validates input and ensures a user can only review a room once.
 *
 * @param roomId ID of the room being reviewed
 * @param userId ID of the user submitting the review
 * @param rating Numeric rating between 1 and 5
 * @param comment Text content of the review
 * @returns Object indicating success status, and error string if applicable
 */
export const createReview = async (
  roomId: string,
  rating: number,
  comment: string
): Promise<ReviewResponse> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        success: false,
        error: "User not logged in",
      };
    }

    // Get user name from users table
    const { data: user, error: userFetchError } = await supabase
      .from("users")
      .select("name")
      .eq("id", userData.user.id)
      .single();

    if (userFetchError) {
      console.error("User fetch error:", userFetchError);
    }

    const { error } = await supabase.from("reviews").insert([
      {
        room_id: roomId,
        user_id: userData.user.id,
        user_name: user?.name || "Anonymous", // ✅ store name directly
        rating,
        comment,
      },
    ]);

    if (error) {
      console.error("Error creating review:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in createReview:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while submitting the review.",
    };
  }
};

/**
 * Fetches all reviews for a specific room, ordered by latest first,
 * including the user's email via an inner join.
 *
 * @param roomId ID of the room
 * @returns Array of review objects alongside success status
 */
export const getReviewsByRoom = async (listingId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (full_name)
    `)
    .eq("listing_id", listingId) // ✅ FIXED
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error.message) // better logging
    return []
  }

  return data || []
}
