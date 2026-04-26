"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SavedRoom } from "@/types/dashboard";
import RoomCard from "@/components/rooms/RoomCard";

export default function SavedRooms({ userId }: { userId: string }) {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedRooms = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_rooms")
          .select("*, rooms(id, title, price, location, image_url)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching saved rooms:", error);
        } else if (data) {
          setSavedRooms(data as SavedRoom[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSavedRooms();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (savedRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-gray-900">
          No saved rooms
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Rooms you bookmark will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {savedRooms.map((saved) =>
        saved.rooms ? (
          <RoomCard key={saved.id} room={{ ...saved.rooms, id: saved.rooms.id }} />
        ) : null
      )}
    </div>
  );
}
