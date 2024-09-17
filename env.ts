export const getEnvVariable = (key: string): string => {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`)
    }
    return value
  }
  
  export const SUPABASE_URL = getEnvVariable('NEXT_PUBLIC_SUPABASE_URL')
  export const SUPABASE_ANON_KEY = getEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY')