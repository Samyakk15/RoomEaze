"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getHostRooms } from "@/services/roomService"
import { getHostRequests } from "@/services/requestService"

export default function HostOverviewPage() {
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch listings count
        const rooms = await getHostRooms(user.id)
        
        // Fetch requests
        const requestsRes = await getHostRequests(user.id)
        const requests = requestsRes.success && Array.isArray(requestsRes.data) ? requestsRes.data : []

        setStats({
          totalListings: rooms.length,
          pendingRequests: requests.filter((r: any) => r.status === "pending").length,
          acceptedRequests: requests.filter((r: any) => r.status === "accepted").length,
        })
      } catch (err) {
        console.error("Error fetching host stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    )
  }

  const quickActions = [
    {
      title: "Add a New Room",
      description: "List a new property for students to discover and request.",
      href: "/host/listings/new",
      icon: (
        <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      color: "bg-rose-50 ring-rose-100",
    },
    {
      title: "View Listings",
      description: "Manage and edit your existing room listings.",
      href: "/host/listings",
      icon: (
        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      color: "bg-blue-50 ring-blue-100",
    },
    {
      title: "Review Requests",
      description: "Accept or reject pending stay requests from students.",
      href: "/host/requests",
      icon: (
        <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
      color: "bg-amber-50 ring-amber-100",
    },
  ]

  return (
    <div>
      {/* Dynamic Request Alert UX */}
      {stats.pendingRequests > 0 && (
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl bg-amber-50 px-6 py-4 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">You have pending requests</h3>
              <p className="text-sm text-amber-700">Review and respond to new booking inquiries from students.</p>
            </div>
          </div>
          <Link
            href="/host/requests"
            className="mt-4 sm:mt-0 whitespace-nowrap rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 transition-colors shadow-sm ring-1 ring-amber-300"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Listings</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalListings}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Requests</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pendingRequests}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Accepted Requests</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.acceptedRequests}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-gray-200"
          >
            <div className={`rounded-xl p-3 ring-1 ${action.color}`}>
              {action.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
