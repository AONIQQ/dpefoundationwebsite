'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Trash2, Upload, UserPlus } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { type ColumnMap, guessColumns, parseCsv, rowsToContacts } from '@/lib/email/csv'
import { type EmailList, GOLD_BUTTON, STATUS_STYLE, api } from './shared'

interface Contact {
  id: number; email: string; first_name: string | null; last_name: string | null; status: string
  source: string | null; created_at: string; list_ids: number[]
}

const PAGE = 100
const STATUSES = ['subscribed', 'unsubscribed', 'bounced', 'complained']

export function ContactsTab({ lists, refresh }: { lists: EmailList[]; refresh: () => Promise<void> }) {
  const [query, setQuery] = useState('')
  const [listFilter, setListFilter] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<{ rows: Contact[]; total: number }>({ rows: [], total: 0 })
  const [selected, setSelected] = useState<number[]>([])

  const load = useCallback(async () => {
    const params = new URLSearchParams({ q: query, limit: String(PAGE), offset: String(offset) })
    if (listFilter) params.set('list', String(listFilter))
    if (statusFilter) params.set('status', statusFilter)
    const result = await api<{ rows: Contact[]; total: number }>(`/api/admin/email/contacts?${params}`)
    if (result) { setData(result); setSelected([]) }
  }, [query, listFilter, statusFilter, offset])

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])

  const reload = async () => { await load(); await refresh() }
  const listName = (id: number) => lists.find((l) => l.id === id)?.name ?? '?'

  const bulk = async (json: Record<string, unknown>, method = 'PATCH') => {
    if (await api('/api/admin/email/contacts', { method, json: { ids: selected, ...json } })) await reload()
  }

  const setStatus = async (c: Contact, status: string) => {
    if (status === 'subscribed' && c.status !== 'subscribed' &&
      !confirm(`Resubscribe ${c.email}? Only do this if they asked to receive Foundation emails again.`)) return
    if (await api('/api/admin/email/contacts', { method: 'PATCH', json: { id: c.id, status } })) await reload()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ImportCard lists={lists} done={reload} />
        <AddContactCard lists={lists} done={reload} />
      </div>

      <Card>
        <CardHeader><CardTitle>Contacts ({data.total})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="Search name or email" value={query} onChange={(e) => { setQuery(e.target.value); setOffset(0) }} />
            <select className="rounded border border-gray-300 bg-white p-2 text-sm" value={listFilter} onChange={(e) => { setListFilter(Number(e.target.value)); setOffset(0) }}>
              <option value={0}>All lists</option>
              {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select className="rounded border border-gray-300 bg-white p-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0) }}>
              <option value="">Any status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded bg-[#fdfcf9] border border-[#eadfc4] p-2 text-sm">
              <span>{selected.length} selected</span>
              <select className="rounded border border-gray-300 bg-white p-1" value="" onChange={(e) => e.target.value && bulk({ addToList: Number(e.target.value) })}>
                <option value="">Add to list…</option>
                {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select className="rounded border border-gray-300 bg-white p-1" value="" onChange={(e) => e.target.value && bulk({ removeFromList: Number(e.target.value) })}>
                <option value="">Remove from list…</option>
                {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <Button size="sm" variant="outline" className="text-red-700"
                onClick={() => confirm(`Delete ${selected.length} contact(s)? Their send history stays, but they lose their unsubscribe/bounce status if re-imported.`) && bulk({}, 'DELETE')}>
                <Trash2 className="mr-1 h-4 w-4" />Delete
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input type="checkbox" checked={data.rows.length > 0 && selected.length === data.rows.length}
                      onChange={(e) => setSelected(e.target.checked ? data.rows.map((r) => r.id) : [])} />
                  </TableHead>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Lists</TableHead><TableHead>Status</TableHead><TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <input type="checkbox" checked={selected.includes(c.id)}
                        onChange={(e) => setSelected((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
                    </TableCell>
                    <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(' ') || <span className="text-gray-400">–</span>}</TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="text-xs">{c.list_ids.map(listName).join(', ') || <span className="text-gray-400">none</span>}</TableCell>
                    <TableCell>
                      <select className={`rounded px-1 py-0.5 text-xs border-0 ${STATUS_STYLE[c.status]}`} value={c.status} onChange={(e) => setStatus(c, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">{c.source ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button size="sm" variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Previous</Button>
            <span>{data.total ? `${offset + 1}–${Math.min(offset + PAGE, data.total)} of ${data.total}` : 'No contacts'}</span>
            <Button size="sm" variant="outline" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ListChooser({ lists, chosen, setChosen }: { lists: EmailList[]; chosen: number[]; setChosen: (ids: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {lists.map((l) => (
        <label key={l.id} className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={chosen.includes(l.id)} onChange={(e) => setChosen(e.target.checked ? [...chosen, l.id] : chosen.filter((x) => x !== l.id))} />
          {l.name}
        </label>
      ))}
    </div>
  )
}

function ImportCard({ lists, done }: { lists: EmailList[]; done: () => Promise<void> }) {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<string[][]>([])
  const [map, setMap] = useState<ColumnMap>({ email: -1, first: -1, last: -1, full: -1 })
  const [hasHeader, setHasHeader] = useState(true)
  const [chosen, setChosen] = useState<number[]>([])
  const [busy, setBusy] = useState(false)

  const read = async (file: File) => {
    const parsed = parseCsv(await file.text())
    const guess = guessColumns(parsed)
    setFileName(file.name)
    setRows(parsed)
    setMap(guess.map)
    setHasHeader(guess.hasHeader)
  }

  const contacts = rows.length ? rowsToContacts(rows, map, hasHeader) : []
  const columns = (hasHeader ? rows[0] : rows[0]?.map((_, i) => `Column ${i + 1}`)) ?? []

  const run = async () => {
    setBusy(true)
    const result = await api<{ added: number; updated: number; invalid: string[] }>('/api/admin/email/contacts', {
      method: 'POST', json: { contacts, listIds: chosen, source: fileName.slice(0, 200) },
    })
    setBusy(false)
    if (!result) return
    toast.success(`${result.added} added, ${result.updated} already existed`)
    if (result.invalid.length) toast.warn(`${result.invalid.length} invalid address(es) skipped: ${result.invalid.slice(0, 5).join(', ')}${result.invalid.length > 5 ? '…' : ''}`)
    setRows([]); setFileName(''); setChosen([])
    await done()
  }

  const columnSelect = (key: keyof ColumnMap, label: string) => (
    <label className="text-sm">{label}
      <select className="ml-1 rounded border border-gray-300 bg-white p-1" value={map[key]} onChange={(e) => setMap({ ...map, [key]: Number(e.target.value) })}>
        <option value={-1}>none</option>
        {columns.map((c, i) => <option key={i} value={i}>{c || `Column ${i + 1}`}</option>)}
      </select>
    </label>
  )

  return (
    <Card>
      <CardHeader><CardTitle>Import a CSV</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Any spreadsheet export works: it needs an email column, and optionally first/last name or a single name column.
          Existing contacts are updated, never resubscribed.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-[#d4af36] px-3 py-2 text-sm text-[#b08d28]">
          <Upload className="h-4 w-4" />{fileName || 'Choose a .csv file'}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} />
        </label>
        {rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-3">
              {columnSelect('email', 'Email')}{columnSelect('first', 'First name')}{columnSelect('last', 'Last name')}{columnSelect('full', 'Full name')}
              <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />First row is a header</label>
            </div>
            <div className="text-sm text-gray-700">
              {contacts.length} contact(s) found. First few: {contacts.slice(0, 3).map((c) => `${c.first_name} ${c.last_name} <${c.email}>`.trim()).join('; ')}
            </div>
            <div className="text-sm font-medium">Add them to</div>
            <ListChooser lists={lists} chosen={chosen} setChosen={setChosen} />
            <Button className={GOLD_BUTTON} disabled={busy || !contacts.length || map.email < 0} onClick={run}>Import {contacts.length}</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function AddContactCard({ lists, done }: { lists: EmailList[]; done: () => Promise<void> }) {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' })
  const [chosen, setChosen] = useState<number[]>([])
  const add = async () => {
    const result = await api<{ added: number; invalid: string[] }>('/api/admin/email/contacts', { method: 'POST', json: { contacts: [form], listIds: chosen, source: 'Added by hand' } })
    if (!result) return
    if (result.invalid.length) { toast.error('That email address is not valid'); return }
    toast.success(result.added ? 'Contact added' : 'Contact already existed; lists updated')
    setForm({ email: '', first_name: '', last_name: '' })
    await done()
  }
  return (
    <Card>
      <CardHeader><CardTitle>Add a contact</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <ListChooser lists={lists} chosen={chosen} setChosen={setChosen} />
        <Button className={GOLD_BUTTON} disabled={!form.email} onClick={add}><UserPlus className="mr-2 h-4 w-4" />Add</Button>
      </CardContent>
    </Card>
  )
}
