/**
 * sync.js — Supabase-synk för hub_data
 *
 * Läsningar görs alltid från localStorage (snabbt, synkront).
 * Skrivningar går till localStorage direkt och till Supabase asynkront.
 * Vid inloggning hämtas all data ned från Supabase och skriver över localStorage.
 */

import { supabase } from './supabase'

// ─── Intern hjälp ────────────────────────────────────────────────────────────

async function getUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

// ─── Push: localStorage → Supabase ───────────────────────────────────────────

/**
 * Synkar en enskild samling till Supabase.
 * Anropas fire-and-forget från storage.js — kastar aldrig fel uppåt.
 */
export async function pushCollection(collection, items) {
  try {
    const user = await getUser()
    if (!user) return

    await supabase
      .from('hub_data')
      .upsert(
        { user_id: user.id, collection, data: items },
        { onConflict: 'user_id,collection' }
      )
  } catch (err) {
    console.warn(`[hub:sync] Push misslyckades (${collection}):`, err?.message)
  }
}

/**
 * Synkar ALL localStorage-data till Supabase på en gång.
 * Används vid första inloggning för att migrera befintlig data.
 */
export async function pushAllCollections(collectionsMap) {
  const user = await getUser()
  if (!user || !supabase) return

  const rows = Object.entries(collectionsMap).map(([collection, data]) => ({
    user_id: user.id,
    collection,
    data,
  }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from('hub_data')
    .upsert(rows, { onConflict: 'user_id,collection' })

  if (error) console.warn('[hub:sync] pushAll misslyckades:', error.message)
  else console.info(`[hub:sync] Migrerade ${rows.length} samlingar till Supabase`)
}

// ─── Pull: Supabase → localStorage ───────────────────────────────────────────

/**
 * Hämtar ALL data från Supabase och skriver till localStorage.
 * Returnerar true om något hämtades, false annars.
 */
export async function pullAllCollections(PREFIX) {
  if (!supabase) return false

  const user = await getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('hub_data')
    .select('collection, data')

  if (error || !data || data.length === 0) {
    console.info('[hub:sync] Ingen data i Supabase ännu')
    return false
  }

  for (const row of data) {
    try {
      localStorage.setItem(PREFIX + row.collection, JSON.stringify(row.data))
    } catch (e) {
      console.warn('[hub:sync] Kunde inte skriva till localStorage:', e)
    }
  }

  console.info(`[hub:sync] Hämtade ${data.length} samlingar från Supabase`)
  return true
}

// ─── Kontrollera om Supabase-data existerar ───────────────────────────────────

/**
 * Returnerar true om användaren redan har data i Supabase.
 * Används för att avgöra om migration behövs.
 */
export async function hasRemoteData() {
  if (!supabase) return false
  const user = await getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('hub_data')
    .select('id')
    .limit(1)

  return !error && data && data.length > 0
}
