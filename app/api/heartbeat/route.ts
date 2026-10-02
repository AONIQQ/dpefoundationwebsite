import { NextResponse } from 'next/server'
import { heartbeat, listRows } from '@/lib/data-store'
export const dynamic = 'force-dynamic'
export async function POST() {
  try { return NextResponse.json({ message: 'Heartbeat updated successfully', data: await heartbeat() }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 }) }
}
export async function GET() {
  try { const { rows } = await listRows('heartbeats', 'id', 1); return NextResponse.json({ message: 'Heartbeat endpoint is working', data: rows }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed to fetch heartbeat' }, { status: 500 }) }
}
