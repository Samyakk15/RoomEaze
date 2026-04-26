"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StayRequest } from "@/types/dashboard";

import Link from "next/link";

export default function MyRequests({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<StayRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from("requests")
          .select("*, rooms(title)")
          .eq("student_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching requests:", error);
        } else if (data) {
          setRequests(data as StayRequest[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  const handleCancelClick = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (error) throw error;

      // Optimistically update the UI to instantly reflect the cancelled state
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "cancelled" } : req))
      );
    } catch (err) {
      console.error("Failed to cancel request:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-gray-900">
          No requests yet
        </h3>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          You haven&apos;t sent any stay requests yet.
        </p>
        <Link
          href="/search"
          className="rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600 transition-colors"
        >
          Browse Rooms
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
        >
          <div>
            <Link href={`/room/${req.room_id}`} className="hover:underline">
              <h3 className="text-base font-semibold text-gray-900">
                {req.rooms?.title || "Unknown Room"}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              Requested on{" "}
              {new Date(req.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(
                req.status
              )}`}
            >
              {req.status}
            </span>
            
            {req.status.toLowerCase() !== "cancelled" && req.status.toLowerCase() !== "rejected" && (
              <button
                onClick={() => handleCancelClick(req.id)}
                className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
