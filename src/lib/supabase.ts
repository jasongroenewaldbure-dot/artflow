import { createClient } from '@supabase/supabase-js'

// Supabase credentials - configured with actual API keys
const supabaseUrl = 'https://mfddxrpiuawggmnzqagn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZGR4cnBpdWF3Z2dtbnpxYWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzY2MjcsImV4cCI6MjA3MDkxMjYyN30.DfF1W6VRqto7KLwatpul63wPJbsJ23cTQ4Z4VGBlKdU'

console.log('✅ Supabase configured with actual API keys')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)