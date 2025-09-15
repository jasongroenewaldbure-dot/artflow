import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || supabaseUrl === '') {
  console.warn('Warning: VITE_SUPABASE_URL is not set. Supabase client will not work properly.')
}

if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.warn('Warning: VITE_SUPABASE_ANON_KEY is not set. Supabase client will not work properly.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)