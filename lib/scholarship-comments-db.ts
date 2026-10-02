import { createClient } from '@supabase/supabase-js'

// Service-role client for the scholarship_comments table. The table has row
// level security with no policies, so this is the only way in. Server-side only.
export function getCommentsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
