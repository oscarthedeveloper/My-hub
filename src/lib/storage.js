/**
 * storage.js — Abstrakt datalager
 *
 * Tier 1: localStorage (snabb, synkron, offline)
 * Tier 2: Supabase (moln-backup, synkad asynkront)
 *
 * API:
 *   storage.get(collection)               → data[]
 *   storage.set(collection, data[])       → void
 *   storage.add(collection, item)         → item (med genererat id)
 *   storage.update(collection, id, patch) → updatedItem
 *   storage.remove(collection, id)        → void
 *   storage.export()                      → { [collection]: data[] }
 */

import { pushCollection } from './sync'

const PREFIX = 'hub:'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── LocalStorage ────────────────────────────────────────────────────────────

function lsGet(collection) {
  try {
    const raw = localStorage.getItem(PREFIX + collection)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function lsSet(collection, data) {
  localStorage.setItem(PREFIX + collection, JSON.stringify(data))
}

// Fire-and-forget Supabase-synk — blockerar aldrig UI
function _sync(collection) {
  pushCollection(collection, lsGet(collection))
}

// ─── Publik API ──────────────────────────────────────────────────────────────

export const storage = {
  get(collection) {
    return lsGet(collection)
  },

  set(collection, data) {
    lsSet(collection, data)
    _sync(collection)
  },

  add(collection, item) {
    const data    = lsGet(collection)
    const newItem = { id: genId(), createdAt: new Date().toISOString(), ...item }
    lsSet(collection, [...data, newItem])
    _sync(collection)
    return newItem
  },

  update(collection, id, patch) {
    const data    = lsGet(collection)
    const updated = data.map(item =>
      item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
    )
    lsSet(collection, updated)
    _sync(collection)
    return updated.find(item => item.id === id)
  },

  remove(collection, id) {
    const data = lsGet(collection)
    lsSet(collection, data.filter(item => item.id !== id))
    _sync(collection)
  },

  /**
   * Exportera all data — returnerar ett objekt { collection: data[] }
   * som kan skickas till pushAllCollections() vid migrering.
   */
  export() {
    const result = {}
    for (const col of Object.values(COLLECTIONS)) {
      const items = lsGet(col)
      if (items.length > 0) result[col] = items
    }
    return result
  },

  /** Importera en tidigare export (JSON-sträng) */
  import(jsonString) {
    try {
      const dump = JSON.parse(jsonString)
      for (const [col, data] of Object.entries(dump)) {
        lsSet(col, data)
      }
      return true
    } catch {
      return false
    }
  },
}

// ─── Collections (konstanter) ────────────────────────────────────────────────

export const COLLECTIONS = {
  PROJECTS:        'projects',
  PROJECT_TODOS:   'projectTodos',
  PROJECT_IDEAS:   'projectIdeas',
  WORDS:           'words',
  NOTES:           'notes',
  GRAMMAR_ENTRIES: 'grammarEntries',
  CONJUGATIONS:    'conjugations',
  HP_SESSIONS:     'hp',
  HP_EXAMS:        'hpExams',
  ORGANIZATIONS:   'organizations',
  PLATFORMS:       'platforms',
  ORG_TODOS:       'orgTodos',
  ORG_GOALS:       'orgGoals',
  READING_LOG:     'readingLog',
  LINKED_DOCS:     'linkedDocs',
  EPOCHS:          'epochs',
  EPOCH_CATS:      'epochCategories',
  EPOCH_SUBS:      'epochSubs',
  DOC_CATEGORIES:       'docCategories',
  READING_CATEGORIES:   'readingCategories',
  LANGUAGES:            'languages',
  TODOS:                'todos',
  VARDAGS_CATEGORIES:   'vardagsCategories',
  VARDAGS_EVENTS:       'vardagsEvents',
  VARDAGS_SOMEDAY:      'vardagsSomeday',
  ORG_CONTACTS:         'orgContacts',
  ORG_LOGS:             'orgLogs',
}

export { PREFIX }
