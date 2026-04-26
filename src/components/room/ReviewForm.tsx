"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createReview } from "@/services/reviewService";

export default function ReviewForm({ roomId }: { roomId: string }) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Basic frontend validation
    if (rating < 1 || rating > 5) {
      setMessage({ type: "error", text: "Please select a valid rating." });
      return;
    }
    if (!comment.trim()) {
      setMessage({ type: "error", text: "Please write a comment before submitting." });
      return;
    }

    setLoading(true);

    try {
      // 2. Fetch current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("AUTH USER ID:", user?.id);

      if (authError || !user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // 3. Call the service
      const response = await createReview(roomId, rating, comment);

      // 4. Handle response properly
      if (response.success) {
        setMessage({ type: "success", text: "Review submitted successfully!" });
        setComment("");
        setRating(5);
        // Refresh the page to show the new review in the server-rendered list
        router.refresh();
      } else {
        if (response.error === "You have already reviewed this room.") {
          setMessage({ type: "info", text: "You have already reviewed this room." });
        } else {
          setMessage({ type: "error", text: response.error || "Failed to submit review." });
        }
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
            Rating
          </label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={loading}
            className="mt-1 block w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50"
          >
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            placeholder="Share your experience..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* UX Feedback Message */}
      {message && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
              : message.type === "info"
              ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

