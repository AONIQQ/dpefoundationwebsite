import { recordOpen } from '@/lib/email/store'
import { validToken } from '@/lib/email/tracking'

export const dynamic = 'force-dynamic'

// 1x1 transparent GIF. Opens are approximate: Apple Mail fetches every image
// up front and many clients block images, so treat the number as a trend.
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  if (validToken(params.token)) {
    try { await recordOpen(params.token) } catch (error) { console.error('Open tracking:', error) }
  }
  return new Response(GIF, {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate, private', 'Content-Length': String(GIF.length) },
  })
}
