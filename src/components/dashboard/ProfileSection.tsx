"use client";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfileSection({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-rose-200 text-3xl font-bold text-rose-600 ring-4 ring-white shadow-sm">
            {user.email ? user.email.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">
              {user.user_metadata?.name || "User Profile"}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Active Account
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Member since</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Last sign in</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString("en-US")
                : "N/A"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-center sm:justify-start">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
