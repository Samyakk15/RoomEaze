import { createBrowserClient } from '@supabase/ssr'

// ── Singleton pattern ──────────────────────────────────
// Only ONE Supabase browser client is ever created.
// Every call to createClient() returns the same instance.
// This prevents multiple GoTrue auth listeners from
// competing for the same Web Lock.
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
