import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateHeartbeat() {
  const { error } = await supabase
    .from('heartbeats')
    .upsert({ id: 1, last_beat: new Date().toISOString() })

  if (error) throw error
}