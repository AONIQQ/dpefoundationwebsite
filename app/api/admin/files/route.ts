import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'
export const dynamic = 'force-dynamic'
const buckets = ['applications', 'proofs', 'fsot', 'weiss-applications', 'weiss-attendance-proof', 'weiss-intern-proof', 'butts-applications', 'butts-attendance-proof', 'butts-requirements', 'lemoine-applications', 'lemoine-resumes', 'lemoine-transcripts', 'lemoine-recommendations']
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!(await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  const params = new URL(request.url).searchParams
  const bucket = params.get('bucket'), path = params.get('path')
  if (!bucket || !buckets.includes(bucket) || !path || path.includes('..') || path.length > 1024) return NextResponse.json({ error: 'Invalid file' }, { status: 400, headers })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300)
  if (error) return NextResponse.json({ error: 'File unavailable' }, { status: 404, headers })
  return NextResponse.json({ url: data.signedUrl }, { headers })
}
