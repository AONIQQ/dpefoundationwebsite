import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'

// Shared plumbing for /api/admin/email/*. The middleware lets /api/ through,
// so the signed admin cookie check here is the real guard.

const headers = { 'Cache-Control': 'no-store' }

export const ok = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers })

export async function isAdmin() {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value)
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

/** Wraps a handler with the admin check and turns thrown errors into a 500 with a readable message. */
export function adminHandler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    if (!(await isAdmin())) return fail('Unauthorized', 401)
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Admin email:', error)
      return fail(error instanceof Error ? error.message : 'Something went wrong', 500)
    }
  }
}

export const positiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0
export const intList = (v: unknown): number[] | null => (Array.isArray(v) && v.every(positiveInt) ? v : null)

const EMAIL = /^[^\s@<>"',;()\\]+@[^\s@<>"',;()\\]+\.[^\s@<>"',;()\\]+$/
export function normalizeEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const email = v.trim().toLowerCase()
  return email.length <= 320 && EMAIL.test(email) ? email : null
}

export function optionalText(v: unknown, max: number): string | null | undefined {
  if (v === undefined) return undefined
  if (v === null) return null
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t ? t.slice(0, max) : null
}
