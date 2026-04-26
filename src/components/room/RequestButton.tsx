"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createRequest } from "@/services/requestService";

export default function RequestButton({ roomId }: { roomId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleRequest = async () => {
    setMessage(null);
    setLoading(true);

    try {
      // 1. Fetch current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // 2. Call the service
      const response = await createRequest(roomId, user.id);

      // 3. Handle service response
      if (response.success) {
        setMessage({ type: "success", text: "Request sent successfully!" });
      } else {
        // Distinguish duplication from other errors based on the returned message
        if (response.error === "Request already exists") {
          setMessage({ type: "info", text: "Request already sent." });
        } else {
          setMessage({ type: "error", text: response.error || "Failed to send request." });
        }
      }
    } catch (err) {
      console.error("Error in handleRequest:", err);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:from-rose-600 hover:to-rose-700 hover:shadow-xl hover:shadow-rose-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Request Stay"}
      </button>

      {/* UX Feedback Message */}
      {message && (
        <div
          className={`mt-3 rounded-lg p-3 text-center text-sm font-medium ${
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

