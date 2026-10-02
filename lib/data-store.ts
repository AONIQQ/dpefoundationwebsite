import postgres from 'postgres'

export const TABLES = ['scholarship_comments', 'bleakley_scholarship_submissions', 'weiss_scholarship_submissions', 'butts_scholarship_submissions', 'lemoine_scholarship_submissions', 'contact_form_submissions', 'heartbeats'] as const
export type TableName = typeof TABLES[number]
export function tableName(value: unknown): value is TableName {
  return typeof value === 'string' && (TABLES as readonly string[]).includes(value)
}
let connection: ReturnType<typeof postgres> | undefined
function sql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  return connection ??= postgres(process.env.DATABASE_URL, { max: 3, idle_timeout: 20, connect_timeout: 15, prepare: false, ssl: 'require' })
}
export function writesPaused() { return process.env.DPE_WRITES_PAUSED === 'true' }
function writable() { if (writesPaused()) throw new Error('Submissions are temporarily paused for maintenance. Please try again shortly.') }
export async function listRows(table: TableName, order: string, limit?: number) {
  const db = sql()
  const rows = await db`select * from ${db(table)} order by ${db(order)} desc, id desc ${limit ? db`limit ${limit}` : db``}`
  const [{ count }] = await db`select count(*)::integer as count from ${db(table)}`
  return { rows: Array.from(rows, row => {
    const id = Number(row.id)
    if (!Number.isSafeInteger(id)) throw new Error('Record ID exceeds supported range')
    return { ...row, id }
  }), total: Number(count) }
}
export async function insertRow(table: TableName, values: Record<string, string | boolean | number | null>) {
  writable()
  const db = sql()
  await db`insert into ${db(table)} ${db(values)}`
}
export async function updateRow(table: TableName, id: number, values: Record<string, string | boolean>) {
  writable()
  const db = sql()
  const rows = await db`update ${db(table)} set ${db(values)} where id = ${id} returning id`
  return rows.length
}
export async function deleteRows(table: TableName, ids: number[]) {
  writable()
  const db = sql()
  const rows = await db`delete from ${db(table)} where id in ${db(ids)} returning id`
  return rows.length
}
export async function heartbeat() {
  writable()
  const db = sql()
  return Array.from(await db`insert into heartbeats (id, last_beat) values (1, now()) on conflict (id) do update set last_beat = excluded.last_beat returning *`)
}
