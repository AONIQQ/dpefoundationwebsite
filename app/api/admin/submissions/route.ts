import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'
import { listRows, updateRow, tableName, writesPaused } from '@/lib/data-store'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
async function authorized() { return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value) }
function scholarshipTable(value: unknown) { return tableName(value) && value.endsWith('_scholarship_submissions') }
export async function GET(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  const table = new URL(request.url).searchParams.get('table')
  if (!tableName(table) || (!scholarshipTable(table) && table !== 'contact_form_submissions')) return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers })
  try { return NextResponse.json(await listRows(table, 'submission_time'), { headers }) }
  catch (error) { console.error('Admin submissions:', error); return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500, headers }) }
}
export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  if (writesPaused()) return NextResponse.json({ error: 'Maintenance in progress' }, { status: 503, headers })
  try {
    const { table, id, values } = await request.json()
    if (!tableName(table) || !scholarshipTable(table) || !Number.isSafeInteger(id) || id < 0 || !values || Array.isArray(values) || typeof values !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
    const entries = Object.entries(values)
    if (!entries.length || entries.some(([key, value]) => key === 'reviewed' ? typeof value !== 'boolean' : key === 'status' ? typeof value !== 'string' || value.length > 200 : key === 'admin_notes' ? typeof value !== 'string' || value.length > 10000 : true)) return NextResponse.json({ error: 'Invalid fields' }, { status: 400, headers })
    const changed = await updateRow(table, id, values)
    return NextResponse.json({ success: true, changed }, { headers })
  } catch (error) { console.error('Update submissions:', error); return NextResponse.json({ error: 'Failed to update submission' }, { status: 500, headers }) }
}
