"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Container from "./Container"
import { createClient } from "@/lib/supabase/client"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user && mounted) {
        setUser(data.user)

        // fetch role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (mounted) setRole(profile?.role || "guest")
      }
      if (mounted) setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        setUser(session.user)
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
        if (mounted) setRole(profile?.role || "guest")
      } else if (mounted) {
        setUser(null)
        setRole(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Dynamic Navigation based on user state and role constraints
  const getNavLinks = () => {
    const links = [{ name: "Search", href: "/search" }]
    
    if (user) {
      if (role === "admin") {
        links.push({ name: "Admin Dashboard", href: "/admin/dashboard" })
      } else if (role === "host") {
        links.push({ name: "Host Dashboard", href: "/host/dashboard" })
      } else {
        links.push({ name: "Dashboard", href: "/dashboard" })
      }
    }
    
    return links
  }
  
  const navLinks = getNavLinks()

  if (loading) return null


  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-rose-500">
              Room<span className="text-gray-900">Eaze</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-rose-500 ${
                  pathname === link.href ? "text-rose-500 font-semibold" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-gray-200 pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-2 px-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href ? "bg-rose-50 text-rose-500" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-col gap-2 px-1 border-t border-gray-200 pt-3">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 w-full"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-rose-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}
