'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { type Overview, GOLD_BUTTON, api, when } from './shared'

// Daily limits for the first weeks of sending from a new domain. Mailbox
// providers judge a new sender on volume growth and complaint rate; a steady
// ramp to engaged recipients first (trustees, then brothers) builds reputation.
const WARMUP = [
  ['Week 1', 50], ['Week 2', 100], ['Week 3', 250], ['Week 4', 500], ['After that', 1000],
] as const

export function SetupTab({ overview, refresh }: { overview: Overview; refresh: () => Promise<void> }) {
  const { settings } = overview
  const [form, setForm] = useState({ daily_cap: String(settings.daily_cap), from_name: settings.from_name, reply_to: settings.reply_to ?? '' })
  const [newList, setNewList] = useState('')

  const save = async () => {
    const ok = await api('/api/admin/email/settings', {
      method: 'PATCH', json: { daily_cap: Number(form.daily_cap), from_name: form.from_name, reply_to: form.reply_to || null },
    })
    if (ok) { toast.success('Settings saved'); await refresh() }
  }

  const togglePause = async () => {
    if (await api('/api/admin/email/settings', { method: 'PATCH', json: { paused: !settings.paused } })) await refresh()
  }

  const addList = async () => {
    if (await api('/api/admin/email/lists', { method: 'POST', json: { name: newList } })) { setNewList(''); await refresh() }
  }

  const removeList = async (id: number, name: string) => {
    if (!confirm(`Delete the list "${name}"? Its contacts stay in Contacts; only the list is removed.`)) return
    if (await api('/api/admin/email/lists', { method: 'DELETE', json: { id } })) await refresh()
  }

  const checkMailbox = async () => {
    const result = await api<{ poll: { bounces: number; replies: number; error?: string } }>('/api/admin/email/run?poll=force', { method: 'POST' })
    if (!result) return
    if (result.poll.error) toast.error(result.poll.error)
    else toast.success(`Mailbox checked: ${result.poll.bounces} new bounce(s), ${result.poll.replies} new repl(ies)`)
    await refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Deliverability checklist</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {overview.checks.map((c) => (
            <div key={c.name} className="flex items-start gap-3">
              {c.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
              <div><div className="font-medium">{c.name}</div><div className="text-sm text-gray-600 break-all">{c.detail}</div></div>
            </div>
          ))}
          <p className="text-sm text-gray-600 pt-2">
            Also register the domain in <a className="text-[#b08d28] underline" href="https://postmaster.google.com" target="_blank" rel="noreferrer">Google Postmaster Tools</a> to
            watch its reputation and spam rate once sending starts. Keep the spam rate under 0.1%.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sending</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium">Daily limit (rolling 24 hours)
            <Input type="number" min={0} max={1900} value={form.daily_cap} onChange={(e) => setForm({ ...form, daily_cap: e.target.value })} className="mt-1 max-w-[10rem]" />
          </label>
          <div className="text-xs text-gray-600">
            Warm-up schedule for a new sending domain: {WARMUP.map(([w, n]) => `${w}: ${n}`).join(' · ')}. Google Workspace caps a mailbox at about 2,000 a day.
          </div>
          <label className="block text-sm font-medium">From name
            <Input value={form.from_name} maxLength={100} onChange={(e) => setForm({ ...form, from_name: e.target.value })} className="mt-1" />
          </label>
          <label className="block text-sm font-medium">Reply-to address (optional)
            <Input type="email" placeholder="Replies go to the sending mailbox if blank" value={form.reply_to} onChange={(e) => setForm({ ...form, reply_to: e.target.value })} className="mt-1" />
          </label>
          <p className="text-xs text-gray-500">Reply tracking only sees replies that reach the sending mailbox, so leave this blank unless replies must go elsewhere.</p>
          <div className="flex flex-wrap gap-2">
            <Button className={GOLD_BUTTON} onClick={save}>Save</Button>
            <Button variant="outline" className={settings.paused ? 'text-green-700' : 'text-amber-700'} onClick={togglePause}>
              {settings.paused ? 'Resume all sending' : 'Pause all sending'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lists</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {overview.lists.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b pb-2">
              <div><div className="font-medium">{l.name}</div><div className="text-xs text-gray-600">{l.subscribed} subscribed · {l.members} total</div></div>
              <Button size="sm" variant="ghost" className="text-red-700" onClick={() => removeList(l.id, l.name)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="New list name" value={newList} maxLength={100} onChange={(e) => setNewList(e.target.value)} />
            <Button variant="outline" disabled={!newList.trim()} onClick={addList}><Plus className="mr-1 h-4 w-4" />Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent replies</CardTitle>
          <Button variant="outline" size="sm" onClick={checkMailbox}>Check mailbox now</Button>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-gray-500">Last checked {when(settings.last_poll_at)}. Read and answer replies in the sending mailbox in Gmail; this list just shows who replied.</p>
          {overview.replies.length === 0 ? <p className="text-sm text-gray-600">No replies yet.</p> : (
            <ul className="space-y-2">
              {overview.replies.map((r, i) => (
                <li key={i} className="text-sm"><span className="font-medium">{r.email}</span> <span className="text-gray-500">on {r.campaign}, {when(r.created_at)}</span><div className="text-gray-700">{r.detail}</div></li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
