'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { ArrowLeft, Copy, Pause, Play, Plus, Send, Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { type CampaignSummary, type EmailList, type Overview, GOLD_BUTTON, STATUS_STYLE, api, pct, when } from './shared'

interface Template { name: string; file: string; subject: string; html: string }
interface Campaign extends CampaignSummary { html: string; updated_at: string }
interface Recipient {
  id: number; email: string; status: string; error: string | null; first_name: string | null; last_name: string | null
  sent_at: string | null; opened_at: string | null; open_count: number; clicked_at: string | null; click_count: number
  unsubscribed_at: string | null; bounced_at: string | null; replied_at: string | null
}

export function CampaignsTab({ overview, refresh }: { overview: Overview; refresh: () => Promise<void> }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const create = async (name: string, subject = '', html = '') => {
    setCreating(true)
    const result = await api<{ id: number }>('/api/admin/email/campaigns', { method: 'POST', json: { name, subject, html } })
    setCreating(false)
    if (result) { await refresh(); setOpenId(result.id) }
  }

  if (openId) {
    return <CampaignDetail id={openId} lists={overview.lists} close={() => { setOpenId(null); refresh() }} duplicate={create} refreshOverview={refresh} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaigns</CardTitle>
        <Button className={GOLD_BUTTON} disabled={creating} onClick={() => create(`Campaign ${new Date().toLocaleDateString()}`)}>
          <Plus className="mr-2 h-4 w-4" />New campaign
        </Button>
      </CardHeader>
      <CardContent>
        {overview.campaigns.length === 0 ? (
          <p className="text-gray-600">No campaigns yet. Start one from the trustees, members or community appeal template.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Opened*</TableHead><TableHead className="text-right">Clicked</TableHead>
                  <TableHead className="text-right">Replied</TableHead><TableHead className="text-right">Bounced</TableHead>
                  <TableHead className="text-right">Unsubscribed</TableHead><TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.campaigns.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-[#fdfcf9]" onClick={() => setOpenId(c.id)}>
                    <TableCell className="font-medium">{c.name}<div className="text-xs text-gray-500">{c.subject}</div></TableCell>
                    <TableCell><span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[c.status]}`}>{c.status}</span></TableCell>
                    <TableCell className="text-right">{c.sent}{c.total > c.sent ? ` / ${c.total}` : ''}</TableCell>
                    <TableCell className="text-right">{pct(c.opened, c.sent)}</TableCell>
                    <TableCell className="text-right">{pct(c.clicked, c.sent)}</TableCell>
                    <TableCell className="text-right">{c.replied}</TableCell>
                    <TableCell className="text-right">{c.bounced}</TableCell>
                    <TableCell className="text-right">{c.unsubscribed}</TableCell>
                    <TableCell className="text-sm text-gray-600">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-2 text-xs text-gray-500">*Opens are approximate: Apple Mail loads every image automatically and many clients block them.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CampaignDetail({ id, lists, close, duplicate, refreshOverview }: {
  id: number; lists: EmailList[]; close: () => void
  duplicate: (name: string, subject: string, html: string) => Promise<void>; refreshOverview: () => Promise<void>
}) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [recipients, setRecipients] = useState<{ rows: Recipient[]; total: number }>({ rows: [], total: 0 })
  const [filter, setFilter] = useState('')
  const [draft, setDraft] = useState({ name: '', subject: '', html: '' })
  const [dirty, setDirty] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [templates, setTemplates] = useState<Template[]>([])
  const [testTo, setTestTo] = useState('')
  const [chosenLists, setChosenLists] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [runStatus, setRunStatus] = useState<string>('')
  const running = useRef(false)

  const load = useCallback(async () => {
    const data = await api<{ campaign: Campaign; recipients: { rows: Recipient[]; total: number } }>(
      `/api/admin/email/campaigns/${id}${filter ? `?filter=${filter}` : ''}`)
    if (!data) return
    setCampaign(data.campaign)
    setRecipients(data.recipients)
    setDraft((d) => (dirty ? d : { name: data.campaign.name, subject: data.campaign.subject, html: data.campaign.html }))
  }, [id, filter, dirty])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api<{ templates: Template[] }>('/api/admin/email/templates', { quiet: true }).then((d) => d && setTemplates(d.templates))
  }, [])

  // While a campaign is sending, keep the queue moving from this page and refresh the numbers.
  const sending = campaign?.status === 'sending'
  useEffect(() => {
    if (!sending) return
    let cancelled = false
    const tick = async () => {
      if (running.current || cancelled) return
      running.current = true
      const result = await api<{ run: { sent: number; stoppedBy: string; queued: number; sentLast24h: number; dailyCap: number; error?: string } }>(
        '/api/admin/email/run', { method: 'POST', quiet: true })
      running.current = false
      if (cancelled) return
      if (result) {
        const r = result.run
        setRunStatus(
          r.stoppedBy === 'cap' ? `Daily limit reached (${r.sentLast24h}/${r.dailyCap}). Open this campaign again tomorrow to send the rest.`
          : r.stoppedBy === 'paused' ? 'All sending is paused in Setup & settings.'
          : r.stoppedBy === 'gmail-error' ? `Gmail error: ${r.error}. Will retry.`
          : r.stoppedBy === 'not-configured' ? 'Gmail sending is not set up. See Setup & settings.'
          : r.queued ? `Sending… ${r.queued} waiting` : 'All queued messages sent.')
      }
      await load()
    }
    tick()
    const timer = setInterval(tick, 8000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [sending, load])

  if (!campaign) return <p className="text-gray-600">Loading…</p>

  const locked = Boolean(campaign.queued_at)
  const edit = (field: keyof typeof draft, value: string) => { setDraft((d) => ({ ...d, [field]: value })); setDirty(true) }

  const save = async () => {
    const values = locked ? { name: draft.name } : draft
    const ok = await api(`/api/admin/email/campaigns/${id}`, { method: 'PATCH', json: values })
    if (ok) { setDirty(false); setPreviewKey((k) => k + 1); toast.success('Saved'); await load() }
    return Boolean(ok)
  }

  const applyTemplate = (file: string) => {
    const t = templates.find((x) => x.file === file)
    if (!t) return
    if (draft.html.trim() && !confirm('Replace the current content with this template?')) return
    setDraft((d) => ({ ...d, html: t.html, subject: d.subject || t.subject }))
    setDirty(true)
  }

  const sendTest = async () => {
    if (dirty && !(await save())) return
    setBusy(true)
    const ok = await api(`/api/admin/email/campaigns/${id}/test`, { method: 'POST', json: { to: testTo } })
    setBusy(false)
    if (ok) toast.success(`Test sent to ${testTo}`)
  }

  const audience = lists.filter((l) => chosenLists.includes(l.id)).reduce((n, l) => n + l.subscribed, 0)
  const queue = async () => {
    if (dirty && !(await save())) return
    if (!confirm(`Send "${draft.subject}" to the subscribed members of ${chosenLists.length} list(s) (up to ${audience} people, fewer if lists overlap)?\n\nThe subject and content are locked once sending starts.`)) return
    setBusy(true)
    const result = await api<{ queued: number }>(`/api/admin/email/campaigns/${id}/queue`, { method: 'POST', json: { listIds: chosenLists } })
    setBusy(false)
    if (result) {
      toast.success(`${result.queued} recipient(s) queued`)
      setChosenLists([])
      await load()
      await refreshOverview()
    }
  }

  const setState = async (action: 'pause' | 'resume') => {
    if (await api(`/api/admin/email/campaigns/${id}`, { method: 'PATCH', json: { action } })) await load()
  }

  const remove = async () => {
    if (!confirm(`Delete "${campaign.name}" and all of its send records? This cannot be undone.`)) return
    if (await api(`/api/admin/email/campaigns/${id}`, { method: 'DELETE' })) close()
  }

  const listPicker = (
    <div className="space-y-2">
      {lists.map((l) => (
        <label key={l.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={chosenLists.includes(l.id)}
            onChange={(e) => setChosenLists((ids) => (e.target.checked ? [...ids, l.id] : ids.filter((x) => x !== l.id)))} />
          {l.name} <span className="text-gray-500">({l.subscribed} subscribed)</span>
        </label>
      ))}
      <Button className={GOLD_BUTTON} disabled={busy || !chosenLists.length || !draft.subject.trim() || !draft.html.trim()} onClick={queue}>
        <Send className="mr-2 h-4 w-4" />{locked ? 'Add these lists' : 'Send to selected lists'}
      </Button>
      {locked && <p className="text-xs text-gray-500">People who were already sent this campaign are not sent it again.</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={close}><ArrowLeft className="mr-2 h-4 w-4" />All campaigns</Button>
        <span className={`rounded px-2 py-1 text-xs ${STATUS_STYLE[campaign.status]}`}>{campaign.status}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {campaign.status === 'sending' && <Button variant="outline" onClick={() => setState('pause')}><Pause className="mr-2 h-4 w-4" />Pause</Button>}
          {campaign.status === 'paused' && <Button variant="outline" onClick={() => setState('resume')}><Play className="mr-2 h-4 w-4" />Resume</Button>}
          <Button variant="outline" onClick={() => duplicate(`${draft.name} (copy)`, draft.subject, draft.html)}><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
          {campaign.status !== 'sending' && <Button variant="outline" className="text-red-700" onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
        </div>
      </div>

      {locked && (
        <Card>
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                ['Recipients', campaign.total], ['Sent', campaign.sent], ['Waiting', campaign.queued],
                ['Opened*', `${campaign.opened} (${pct(campaign.opened, campaign.sent)})`],
                ['Clicked', `${campaign.clicked} (${pct(campaign.clicked, campaign.sent)})`],
                ['Replied', campaign.replied], ['Bounced', campaign.bounced], ['Unsubscribed', campaign.unsubscribed],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-[#eadfc4] bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
                  <div className="text-lg font-semibold text-[#1f2a44]">{value}</div>
                </div>
              ))}
            </div>
            {campaign.total > 0 && (
              <div className="mt-4 h-2 w-full rounded bg-gray-100">
                <div className="h-2 rounded bg-[#d4af36]" style={{ width: `${Math.round(((campaign.total - campaign.queued) / campaign.total) * 100)}%` }} />
              </div>
            )}
            {sending && <p className="mt-3 text-sm text-gray-700">{runStatus || 'Sending…'} Sending runs while this page is open. If you close it, it picks up where it left off next time you open the campaign.</p>}
            {(campaign.failed > 0 || campaign.skipped > 0) && (
              <p className="mt-2 text-sm text-gray-600">{campaign.failed} failed · {campaign.skipped} skipped (unsubscribed or bounced before their turn)</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{locked ? 'Campaign' : 'Compose'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">Name (internal)
              <Input value={draft.name} onChange={(e) => edit('name', e.target.value)} className="mt-1" />
            </label>
            <label className="block text-sm font-medium">Subject line
              <Input value={draft.subject} disabled={locked} onChange={(e) => edit('subject', e.target.value)} className="mt-1" maxLength={300} />
            </label>
            {!locked && templates.length > 0 && (
              <label className="block text-sm font-medium">Start from a template
                <select className="mt-1 block w-full rounded border border-gray-300 bg-white p-2" value="" onChange={(e) => applyTemplate(e.target.value)}>
                  <option value="">Choose…</option>
                  {templates.map((t) => <option key={t.file} value={t.file}>{t.name}</option>)}
                </select>
              </label>
            )}
            <label className="block text-sm font-medium">Email HTML
              <Textarea value={draft.html} disabled={locked} onChange={(e) => edit('html', e.target.value)} className="mt-1 h-72 font-mono text-xs" />
            </label>
            <p className="text-xs text-gray-500">
              Merge fields: {'{{FirstName}}'} (or {'{{FirstName|Brother}}'} with a fallback), {'{{LastName}}'}, {'{{DONATE_URL}}'}, {'{{DESIGNATION_FORM_URL}}'}, {'{{UnsubscribeURL}}'}.
              Links are tracked automatically. If the email has no unsubscribe link, one is added at the bottom.
            </p>
            <Button className={GOLD_BUTTON} disabled={!dirty} onClick={save}>Save</Button>

            <div className="border-t pt-4 space-y-2">
              <div className="text-sm font-medium">Send a test</div>
              <div className="flex gap-2">
                <Input type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <Button variant="outline" disabled={busy || !testTo} onClick={sendTest}>Send test</Button>
              </div>
            </div>

            {campaign.status !== 'done' || locked ? (
              <div className="border-t pt-4 space-y-2">
                <div className="text-sm font-medium">{locked ? 'Send to more lists' : 'Send'}</div>
                {listPicker}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            {dirty && <p className="mb-2 text-xs text-amber-700">Save to update the preview.</p>}
            <iframe key={previewKey} title="Email preview" sandbox="" src={`/api/admin/email/campaigns/${id}/preview?name=Andrew&v=${previewKey}`}
              className="h-[640px] w-full rounded border border-gray-200 bg-white" />
            <a className="mt-2 inline-block text-xs text-[#b08d28] underline" target="_blank" rel="noreferrer"
              href={`/api/admin/email/campaigns/${id}/preview?format=text&v=${previewKey}`}>View the plain-text version</a>
          </CardContent>
        </Card>
      </div>

      {locked && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>Recipients ({recipients.total})</CardTitle>
            <select className="rounded border border-gray-300 bg-white p-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              {['queued', 'sent', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed', 'failed', 'skipped'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead><TableHead>Clicked</TableHead><TableHead>Replied</TableHead><TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{[r.first_name, r.last_name].filter(Boolean).join(' ')}<div className="text-xs text-gray-500">{r.email}</div></TableCell>
                    <TableCell><span className={`rounded px-2 py-0.5 text-xs ${r.unsubscribed_at ? STATUS_STYLE.unsubscribed : STATUS_STYLE[r.status] ?? 'bg-gray-100'}`}>{r.unsubscribed_at ? 'unsubscribed' : r.status}</span></TableCell>
                    <TableCell className="text-sm">{when(r.sent_at)}</TableCell>
                    <TableCell className="text-sm">{r.opened_at ? `${when(r.opened_at)} (${r.open_count}×)` : '–'}</TableCell>
                    <TableCell className="text-sm">{r.clicked_at ? `${when(r.clicked_at)} (${r.click_count}×)` : '–'}</TableCell>
                    <TableCell className="text-sm">{when(r.replied_at)}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-gray-600" title={r.error ?? ''}>{r.error ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recipients.total > recipients.rows.length && <p className="mt-2 text-xs text-gray-500">Showing the first {recipients.rows.length}.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
