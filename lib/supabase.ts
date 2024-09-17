import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example function to test Supabase connection and permissions
export async function testSupabaseConnection() {
  try {
    // Test scholarship_submissions table
    const { data: scholarshipData, error: scholarshipError } = await supabase
      .from('scholarship_submissions')
      .select('*')
      .limit(1)

    if (scholarshipError) {
      console.error('Error fetching scholarship submissions:', scholarshipError)
    } else {
      console.log('Scholarship submissions test:', scholarshipData)
    }

    // Test contact_form_submissions table
    const { data: contactData, error: contactError } = await supabase
      .from('contact_form_submissions')
      .select('*')
      .limit(1)

    if (contactError) {
      console.error('Error fetching contact form submissions:', contactError)
    } else {
      console.log('Contact form submissions test:', contactData)
    }

    // If both queries succeed without errors, connection is working
    if (!scholarshipError && !contactError) {
      console.log('Supabase connection and permissions are working correctly')
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
  }
}