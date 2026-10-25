'use client'

import { toast } from 'react-toastify'

export interface EmailList { id: number; name: string; description: string | null; members: number; subscribed: number }
export interface Settings { daily_cap: number; from_name: string; reply_to: string | null; paused: boolean; last_poll_at: string | null }
export interface Check { name: string; ok: boolean; detail: string }
export interface CampaignSummary {
  id: number; name: string; subject: string; status: 'draft' | 'sending' | 'paused' | 'done'
  created_at: string; queued_at: string | null; completed_at: string | null
  total: number; queued: number; sent: number; failed: number; skipped: number; bounced: number
  opened: number; clicked: number; unsubscribed: number; replied: number
}
export interface Reply { created_at: string; detail: string | null; email: string; campaign: string }
export interface Overview {
  settings: Settings; lists: EmailList[]; campaigns: CampaignSummary[]; checks: Check[]
  queued: number; sent24h: number; replies: Reply[]
}

/** fetch + JSON + error toast. Returns null on failure (the toast has already explained). */
export async function api<T = Record<string, unknown>>(url: string, init?: RequestInit & { json?: unknown; quiet?: boolean }): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: init?.json !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    })
    if (response.status === 401) { window.location.href = '/admin/login'; return null }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`)
    return body as T
  } catch (error) {
    if (!init?.quiet) toast.error(error instanceof Error ? error.message : 'Request failed')
    return null
  }
}

export const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '–')
export const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '–')

export const GOLD_BUTTON = 'bg-[#d4af36] hover:bg-[#b08d28] text-white'
export const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sending: 'bg-blue-100 text-blue-800',
  paused: 'bg-amber-100 text-amber-800',
  done: 'bg-green-100 text-green-800',
  subscribed: 'bg-green-100 text-green-800',
  unsubscribed: 'bg-gray-100 text-gray-700',
  bounced: 'bg-red-100 text-red-800',
  complained: 'bg-red-100 text-red-800',
}
