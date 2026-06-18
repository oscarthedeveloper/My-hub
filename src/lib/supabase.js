import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('[hub] Supabase-nycklar saknas i .env — kör i localStorage-only-läge')
}

export const supabase = url && key ? createClient(url, key) : null
