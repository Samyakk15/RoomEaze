// Re-export the singleton client from the canonical location
// This ensures ALL browser-side code shares one Supabase instance
import { createClient } from "@/lib/supabase/client"

export const supabase = createClient()
