"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function TestPage() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")

      console.log("DATA:", data)
      console.log("ERROR:", error)
    }

    fetchData()
  }, [])

  return <div>Check console</div>
}
