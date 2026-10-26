import { adminHandler, fail, intList, normalizeEmail, ok, optionalText, positiveInt, readJson } from '@/lib/email/admin-route'
import {
  CONTACT_STATUSES, type ContactInput, type ContactStatus, addToList, deleteContacts, listContacts, removeFromList,
  updateContact, upsertContacts,
} from '@/lib/email/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_IMPORT = 20000

export const GET = adminHandler(async (request: Request) => {
  const params = new URL(request.url).searchParams
  const listId = Number(params.get('list') || 0)
  const status = params.get('status') || undefined
  if (status && !(CONTACT_STATUSES as readonly string[]).includes(status)) return fail('Invalid status')
  const limit = Math.min(Math.max(Number(params.get('limit') || 100), 1), 500)
  const offset = Math.max(Number(params.get('offset') || 0), 0)
  return ok(await listContacts({ search: params.get('q')?.trim() || undefined, listId: listId > 0 ? listId : undefined, status, limit, offset }))
})

/**
 * Add one contact or import many: { contacts: [{ email, first_name, last_name }], listIds, source }.
 * Invalid addresses are reported back, not imported.
 */
export const POST = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  const listIds = intList(body?.listIds ?? [])
  if (!body || !Array.isArray(body.contacts) || !listIds) return fail('contacts and listIds are required')
  if (body.contacts.length > MAX_IMPORT) return fail(`Import at most ${MAX_IMPORT.toLocaleString()} contacts at a time`)
  const valid = new Map<string, ContactInput>()
  const invalid: string[] = []
  for (const raw of body.contacts as Record<string, unknown>[]) {
    const email = normalizeEmail(raw?.email)
    if (!email) { invalid.push(String(raw?.email ?? '').slice(0, 100)); continue }
    // The same address twice in one file: keep whichever names were given.
    const prior = valid.get(email)
    valid.set(email, {
      email,
      first_name: optionalText(raw.first_name, 200) || prior?.first_name || null,
      last_name: optionalText(raw.last_name, 200) || prior?.last_name || null,
    })
  }
  const result = valid.size ? await upsertContacts(Array.from(valid.values()), listIds, optionalText(body.source, 200) ?? null) : { added: 0, updated: 0 }
  return ok({ ...result, invalid })
})

export const PATCH = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  if (!body) return fail('Invalid request')

  // Bulk list membership: { ids, addToList } or { ids, removeFromList }.
  const ids = intList(body.ids)
  if (ids?.length && positiveInt(body.addToList)) { await addToList(body.addToList, ids); return ok({ success: true }) }
  if (ids?.length && positiveInt(body.removeFromList)) { await removeFromList(body.removeFromList, ids); return ok({ success: true }) }

  if (!positiveInt(body.id)) return fail('id is required')
  const values: Parameters<typeof updateContact>[1] = {}
  const first = optionalText(body.first_name, 200)
  const last = optionalText(body.last_name, 200)
  const notes = optionalText(body.notes, 5000)
  if (first !== undefined) values.first_name = first
  if (last !== undefined) values.last_name = last
  if (notes !== undefined) values.notes = notes
  if (body.status !== undefined) {
    if (!(CONTACT_STATUSES as readonly string[]).includes(String(body.status))) return fail('Invalid status')
    values.status = body.status as ContactStatus
  }
  const listIds = body.listIds === undefined ? undefined : intList(body.listIds)
  if (listIds === null) return fail('Invalid listIds')
  await updateContact(body.id, values, listIds)
  return ok({ success: true })
})

export const DELETE = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  const ids = intList(body?.ids)
  if (!ids?.length) return fail('ids are required')
  return ok({ deleted: await deleteContacts(ids) })
})
