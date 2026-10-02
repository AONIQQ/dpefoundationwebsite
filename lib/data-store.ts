import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'

export const TABLES = ['scholarship_comments', 'bleakley_scholarship_submissions', 'weiss_scholarship_submissions', 'butts_scholarship_submissions', 'lemoine_scholarship_submissions', 'contact_form_submissions', 'heartbeats'] as const
export type TableName = typeof TABLES[number]
export function tableName(value: unknown): value is TableName {
  return typeof value === 'string' && (TABLES as readonly string[]).includes(value)
}
let connection: ReturnType<typeof postgres> | undefined
function sql() {
  if (!process.env.DATABASE_URL) return null
  return connection ??= postgres(process.env.DATABASE_URL, { max: 3, idle_timeout: 20, connect_timeout: 15, prepare: false, ssl: 'require' })
}
function source() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Database is not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
export function writesPaused() { return process.env.DPE_WRITES_PAUSED === 'true' }
function writable() { if (writesPaused()) throw new Error('Submissions are temporarily paused for maintenance. Please try again shortly.') }
export async function listRows(table: TableName, order: string, limit?: number) {
  const db = sql()
  if (db) {
    const rows = await db`select * from ${db(table)} order by ${db(order)} desc, id desc ${limit ? db`limit ${limit}` : db``}`
    const [{ count }] = await db`select count(*)::integer as count from ${db(table)}`
    return { rows: Array.from(rows, row => {
      const id = Number(row.id)
      if (!Number.isSafeInteger(id)) throw new Error('Record ID exceeds supported range')
      return { ...row, id }
    }), total: Number(count) }
  }
  let query = source().from(table).select('*', { count: 'exact' }).order(order, { ascending: false }).order('id', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error, count } = await query
  if (error) throw error
  return { rows: data ?? [], total: count ?? data?.length ?? 0 }
}
export async function insertRow(table: TableName, values: Record<string, string | boolean | number | null>) {
  writable()
  const db = sql()
  if (db) { await db`insert into ${db(table)} ${db(values)}`; return }
  const { error } = await source().from(table).insert(values)
  if (error) throw error
}
export async function updateRow(table: TableName, id: number, values: Record<string, string | boolean>) {
  writable()
  const db = sql()
  if (db) { const rows = await db`update ${db(table)} set ${db(values)} where id = ${id} returning id`; return rows.length }
  const { error, data } = await source().from(table).update(values).eq('id', id).select('id')
  if (error) throw error
  return data?.length ?? 0
}
export async function deleteRows(table: TableName, ids: number[]) {
  writable()
  const db = sql()
  if (db) { const rows = await db`delete from ${db(table)} where id in ${db(ids)} returning id`; return rows.length }
  const { data, error } = await source().from(table).delete().in('id', ids).select('id')
  if (error) throw error
  return data?.length ?? 0
}
export async function heartbeat() {
  writable()
  const db = sql()
  if (db) return Array.from(await db`insert into heartbeats (id, last_beat) values (1, now()) on conflict (id) do update set last_beat = excluded.last_beat returning *`)
  const { data, error } = await source().from('heartbeats').upsert({ id: 1, last_beat: new Date().toISOString() }).select()
  if (error) throw error
  return data
}
