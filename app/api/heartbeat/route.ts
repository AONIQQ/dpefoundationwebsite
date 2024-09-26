import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  console.log('Heartbeat POST request received')
  try {
    const { data, error } = await supabase
      .from('heartbeats')
      .upsert({ id: 1, last_beat: new Date().toISOString() })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Heartbeat updated successfully:', data)
    return NextResponse.json({ message: 'Heartbeat updated successfully', data }, { status: 200 })
  } catch (error) {
    console.error('Error updating heartbeat:', error as Error) // Type assertion
    return NextResponse.json({ error: 'Failed to update heartbeat', details: (error as Error).message }, { status: 500 })
  }
}

export async function GET() {
  console.log('Heartbeat GET request received')
  try {
    const { data, error } = await supabase
      .from('heartbeats')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Heartbeat data fetched:', data)
    return NextResponse.json({ message: 'Heartbeat endpoint is working', data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching heartbeat:', error as Error) // Type assertion
    return NextResponse.json({ error: 'Failed to fetch heartbeat', details: (error as Error).message }, { status: 500 })
  }
}