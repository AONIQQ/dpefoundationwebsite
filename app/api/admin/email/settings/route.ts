import { adminHandler, fail, normalizeEmail, ok, readJson } from '@/lib/email/admin-route'
import { updateSettings } from '@/lib/email/store'

export const dynamic = 'force-dynamic'

export const PATCH = adminHandler(async (request: Request) => {
  const body = await readJson(request)
  if (!body) return fail('Invalid request')
  const values: Parameters<typeof updateSettings>[0] = {}
  if (body.daily_cap !== undefined) {
    if (typeof body.daily_cap !== 'number' || !Number.isInteger(body.daily_cap) || body.daily_cap < 0 || body.daily_cap > 1900) {
      return fail('Daily limit must be a whole number from 0 to 1,900')
    }
    values.daily_cap = body.daily_cap
  }
  if (body.from_name !== undefined) {
    const name = typeof body.from_name === 'string' ? body.from_name.trim() : ''
    if (!name || name.length > 100) return fail('From name is required (up to 100 characters)')
    values.from_name = name
  }
  if (body.reply_to !== undefined) {
    if (body.reply_to === null || body.reply_to === '') values.reply_to = null
    else {
      const email = normalizeEmail(body.reply_to)
      if (!email) return fail('Reply-to must be an email address')
      values.reply_to = email
    }
  }
  if (body.paused !== undefined) {
    if (typeof body.paused !== 'boolean') return fail('Invalid paused value')
    values.paused = body.paused
  }
  if (!Object.keys(values).length) return fail('Nothing to update')
  await updateSettings(values)
  return ok({ success: true })
})
