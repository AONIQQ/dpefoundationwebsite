import { adminHandler, fail, ok, optionalText, positiveInt, readJson } from '@/lib/email/admin-route'
import { createList, deleteList } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

export const POST = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name || name.length > 100) return fail('List name is required (up to 100 characters)')
  try {
    return ok({ id: await createList(name, optionalText(body?.description, 1000) ?? null) })
  } catch (error) {
    if (String(error).includes('unique')) return fail('A list with that name already exists')
    throw error
  }
})

// Deleting a list removes memberships only; the contacts stay.
export const DELETE = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  if (!positiveInt(body?.id)) return fail('id is required')
  await deleteList(body.id)
  return ok({ success: true })
})
