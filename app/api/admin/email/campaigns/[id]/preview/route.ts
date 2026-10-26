import { adminHandler, fail } from '@/lib/email/admin-route'
import { renderForRecipient } from '@/lib/email/render'
import { getCampaign } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

// The campaign as a sample recipient sees it, for the editor's preview frame.
// Served with a sandboxing CSP: the HTML is admin-authored, but there is no
// reason for it to run scripts inside the dashboard's origin.
export const GET = adminHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const campaign = await getCampaign(Number(params.id))
  if (!campaign) return fail('Campaign not found', 404)
  const name = new URL(request.url).searchParams.get('name') ?? ''
  const { html, text } = renderForRecipient(String(campaign.html), { email: 'preview@example.com', first_name: name }, 'preview', [], { track: false })
  const asText = new URL(request.url).searchParams.get('format') === 'text'
  return new Response(asText ? text : html, {
    headers: {
      'Content-Type': asText ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8',
      'Content-Security-Policy': "sandbox; default-src 'none'; img-src * data:; style-src 'unsafe-inline' *; font-src *",
      'Cache-Control': 'no-store',
    },
  })
})
