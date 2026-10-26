import { NextResponse } from 'next/server'
import { publicBaseUrl } from '@/lib/email/render'
import { recordClick } from '@/lib/email/store'
import { validToken } from '@/lib/email/tracking'

export const dynamic = 'force-dynamic'

// Logs the click and forwards to the link. Only links stored with the
// campaign can be targets, so this can't be used as an open redirect.
export async function GET(_request: Request, { params }: { params: { token: string; index: string } }) {
  const index = Number(params.index)
  let url: string | null = null
  if (validToken(params.token) && Number.isSafeInteger(index) && index >= 0) {
    try { url = await recordClick(params.token, index) } catch (error) { console.error('Click tracking:', error) }
  }
  return NextResponse.redirect(url ?? publicBaseUrl(), { status: 302, headers: { 'Cache-Control': 'no-store' } })
}
