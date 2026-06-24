import { create } from 'zustand'
import { storage, COLLECTIONS } from '@/lib/storage'

// ─── Tema ─────────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

applyTheme(localStorage.getItem('hub:theme') ?? 'light')

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('hub:theme') ?? 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('hub:theme', next)
    applyTheme(next)
    set({ theme: next })
  },
}))

// ─── Projects ────────────────────────────────────────────────────────────────

export const useProjectStore = create((set, get) => ({
  projects: storage.get(COLLECTIONS.PROJECTS),
  todos:    storage.get(COLLECTIONS.PROJECT_TODOS),
  ideas:    storage.get(COLLECTIONS.PROJECT_IDEAS),

  addProject: (project) => {
    const item = storage.add(COLLECTIONS.PROJECTS, project)
    set(state => ({ projects: [...state.projects, item] }))
    return item
  },
  updateProject: (id, patch) => {
    const item = storage.update(COLLECTIONS.PROJECTS, id, patch)
    set(state => ({ projects: state.projects.map(p => (p.id === id ? item : p)) }))
    return item
  },
  removeProject: (id) => {
    storage.remove(COLLECTIONS.PROJECTS, id)
    const todos = storage.get(COLLECTIONS.PROJECT_TODOS).filter(t => t.projectId !== id)
    const ideas = storage.get(COLLECTIONS.PROJECT_IDEAS).filter(i => i.projectId !== id)
    storage.set(COLLECTIONS.PROJECT_TODOS, todos)
    storage.set(COLLECTIONS.PROJECT_IDEAS, ideas)
    set(state => ({ projects: state.projects.filter(p => p.id !== id), todos, ideas }))
  },

  addTodo: (projectId, todo) => {
    const item = storage.add(COLLECTIONS.PROJECT_TODOS, { ...todo, projectId, status: 'todo' })
    set(state => ({ todos: [...state.todos, item] }))
    return item
  },
  updateTodo: (id, patch) => {
    const item = storage.update(COLLECTIONS.PROJECT_TODOS, id, patch)
    set(state => ({ todos: state.todos.map(t => (t.id === id ? item : t)) }))
    return item
  },
  removeTodo: (id) => {
    storage.remove(COLLECTIONS.PROJECT_TODOS, id)
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))
  },
  todosForProject: (projectId) => get().todos.filter(t => t.projectId === projectId),

  addIdea: (projectId, idea) => {
    const item = storage.add(COLLECTIONS.PROJECT_IDEAS, { ...idea, projectId })
    set(state => ({ ideas: [...state.ideas, item] }))
    return item
  },
  updateIdea: (id, patch) => {
    const item = storage.update(COLLECTIONS.PROJECT_IDEAS, id, patch)
    set(state => ({ ideas: state.ideas.map(i => (i.id === id ? item : i)) }))
    return item
  },
  removeIdea: (id) => {
    storage.remove(COLLECTIONS.PROJECT_IDEAS, id)
    set(state => ({ ideas: state.ideas.filter(i => i.id !== id) }))
  },
  ideasForProject: (projectId) => get().ideas.filter(i => i.projectId === projectId),
}))

// ─── Language config (default seed) ──────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase()
    .replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

const DEFAULT_LANGUAGES = [
  {
    id: 'fornsvenska', label: 'Fornsvenska', color: '#34d399', flag: 'ᚠᚢᚦ',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd',    type: 'docs',         builtin: true },
      { id: 'grammatik',    label: 'Grammatik',    type: 'docs',         builtin: true },
      { id: 'fonologi',     label: 'Fonologi',     type: 'fonologi',     builtin: true },
      { id: 'anteckningar', label: 'Anteckningar', type: 'notes',        builtin: true },
    ],
  },
  {
    id: 'svenska', label: 'Svenska', color: '#7c72f5', flag: 'SV',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd',    type: 'docs',         builtin: true },
      { id: 'grammatik',    label: 'Grammatik',    type: 'docs',         builtin: true },
      { id: 'ovningar',     label: 'Övningar',     type: 'ovningar',     builtin: true },
      { id: 'anteckningar', label: 'Anteckningar', type: 'notes',        builtin: true },
    ],
  },
  {
    id: 'italienska', label: 'Italienska', color: '#22d3ee', flag: 'IT',
    tabs: [
      { id: 'ordforrad',     label: 'Ordförråd',     type: 'docs',          builtin: true },
      { id: 'grammatik',     label: 'Grammatik',     type: 'docs',          builtin: true },
      { id: 'konjugationer', label: 'Konjugationer', type: 'konjugationer', builtin: true },
      { id: 'anteckningar',  label: 'Anteckningar',  type: 'notes',         builtin: true },
    ],
  },
  {
    id: 'engelska', label: 'Engelska', color: '#fbbf24', flag: 'EN',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd',    type: 'docs',  builtin: true },
      { id: 'grammatik',    label: 'Grammatik',    type: 'docs',  builtin: true },
      { id: 'anteckningar', label: 'Anteckningar', type: 'notes', builtin: true },
    ],
  },
]

function seedLanguages() {
  const existing = storage.get(COLLECTIONS.LANGUAGES)
  if (existing.length > 0) return existing
  storage.set(COLLECTIONS.LANGUAGES, DEFAULT_LANGUAGES)
  return DEFAULT_LANGUAGES
}

// ─── Linguistics ─────────────────────────────────────────────────────────────

export const useLinguisticsStore = create((set, get) => ({
  languages:      seedLanguages(),
  words:          storage.get(COLLECTIONS.WORDS),
  notes:          storage.get(COLLECTIONS.NOTES),
  grammarEntries: storage.get(COLLECTIONS.GRAMMAR_ENTRIES),
  conjugations:   storage.get(COLLECTIONS.CONJUGATIONS),
  readingLog:     storage.get(COLLECTIONS.READING_LOG),
  linkedDocs:     storage.get(COLLECTIONS.LINKED_DOCS),
  docCategories:  storage.get(COLLECTIONS.DOC_CATEGORIES),

  // ─── Doc Categories ───────────────────────────────────────────────────────

  categoriesByScope: (language, section) =>
    get().docCategories.filter(c => c.language === language && c.section === section),

  addDocCategory: (language, section, { name, color }) => {
    const item = storage.add(COLLECTIONS.DOC_CATEGORIES, { language, section, name, color, docs: [] })
    set(state => ({ docCategories: [...state.docCategories, item] }))
    return item
  },
  updateDocCategory: (id, patch) => {
    const item = storage.update(COLLECTIONS.DOC_CATEGORIES, id, patch)
    set(state => ({ docCategories: state.docCategories.map(c => c.id === id ? item : c) }))
    return item
  },
  removeDocCategory: (id) => {
    storage.remove(COLLECTIONS.DOC_CATEGORIES, id)
    set(state => ({ docCategories: state.docCategories.filter(c => c.id !== id) }))
  },

  addDoc: (categoryId, doc) => {
    const cat = get().docCategories.find(c => c.id === categoryId)
    if (!cat) return null
    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      addedAt: new Date().toISOString(),
      ...doc,
    }
    const updated = storage.update(COLLECTIONS.DOC_CATEGORIES, categoryId, {
      docs: [...(cat.docs ?? []), newDoc],
    })
    set(state => ({ docCategories: state.docCategories.map(c => c.id === categoryId ? updated : c) }))
    return newDoc
  },
  updateDoc: (categoryId, docId, patch) => {
    const cat = get().docCategories.find(c => c.id === categoryId)
    if (!cat) return
    const docs = (cat.docs ?? []).map(d => d.id === docId ? { ...d, ...patch } : d)
    const updated = storage.update(COLLECTIONS.DOC_CATEGORIES, categoryId, { docs })
    set(state => ({ docCategories: state.docCategories.map(c => c.id === categoryId ? updated : c) }))
  },
  removeDoc: (categoryId, docId) => {
    const cat = get().docCategories.find(c => c.id === categoryId)
    if (!cat) return
    const docs = (cat.docs ?? []).filter(d => d.id !== docId)
    const updated = storage.update(COLLECTIONS.DOC_CATEGORIES, categoryId, { docs })
    set(state => ({ docCategories: state.docCategories.map(c => c.id === categoryId ? updated : c) }))
  },

  // ─── Languages ────────────────────────────────────────────────────────────

  addLanguage: ({ label, color, flag }) => {
    const id = slugify(label) || Date.now().toString(36)
    if (get().languages.some(l => l.id === id)) return null
    const tabs = [
      { id: 'ordforrad',    label: 'Ordförråd',    type: 'docs',  builtin: true },
      { id: 'grammatik',    label: 'Grammatik',    type: 'docs',  builtin: true },
      { id: 'anteckningar', label: 'Anteckningar', type: 'notes', builtin: true },
    ]
    const item = storage.add(COLLECTIONS.LANGUAGES, { id, label, color, flag, tabs })
    set(state => ({ languages: [...state.languages, item] }))
    return item
  },
  updateLanguage: (id, patch) => {
    const item = storage.update(COLLECTIONS.LANGUAGES, id, patch)
    set(state => ({ languages: state.languages.map(l => l.id === id ? item : l) }))
    return item
  },
  removeLanguage: (id) => {
    storage.remove(COLLECTIONS.LANGUAGES, id)
    const remaining = storage.get(COLLECTIONS.DOC_CATEGORIES).filter(c => c.language !== id)
    storage.set(COLLECTIONS.DOC_CATEGORIES, remaining)
    set(state => ({ languages: state.languages.filter(l => l.id !== id), docCategories: remaining }))
  },
  addCustomTab: (langId, { label, type }) => {
    const lang = get().languages.find(l => l.id === langId)
    if (!lang) return
    const tabId = slugify(label) + '_' + Date.now().toString(36)
    const newTab = { id: tabId, label, type, builtin: false }
    const updated = storage.update(COLLECTIONS.LANGUAGES, langId, { tabs: [...lang.tabs, newTab] })
    set(state => ({ languages: state.languages.map(l => l.id === langId ? updated : l) }))
    return newTab
  },
  removeCustomTab: (langId, tabId) => {
    const lang = get().languages.find(l => l.id === langId)
    if (!lang) return
    const tabs = lang.tabs.filter(t => t.id !== tabId || t.builtin)
    const updated = storage.update(COLLECTIONS.LANGUAGES, langId, { tabs })
    set(state => ({ languages: state.languages.map(l => l.id === langId ? updated : l) }))
  },

  addLinkedDoc: (doc) => {
    const item = storage.add(COLLECTIONS.LINKED_DOCS, doc)
    set(state => ({ linkedDocs: [...state.linkedDocs, item] }))
    return item
  },
  updateLinkedDoc: (id, patch) => {
    const item = storage.update(COLLECTIONS.LINKED_DOCS, id, patch)
    set(state => ({ linkedDocs: state.linkedDocs.map(d => (d.id === id ? item : d)) }))
    return item
  },
  removeLinkedDoc: (id) => {
    storage.remove(COLLECTIONS.LINKED_DOCS, id)
    set(state => ({ linkedDocs: state.linkedDocs.filter(d => d.id !== id) }))
  },
  docsByScope: (language, view, category = null) =>
    get().linkedDocs.filter(d =>
      d.language === language &&
      d.view === view &&
      (category === null ? !d.category : d.category === category)
    ),

  addWord: (word) => {
    const item = storage.add(COLLECTIONS.WORDS, word)
    set(state => ({ words: [...state.words, item] }))
    return item
  },
  updateWord: (id, patch) => {
    const item = storage.update(COLLECTIONS.WORDS, id, patch)
    set(state => ({ words: state.words.map(w => (w.id === id ? item : w)) }))
    return item
  },
  removeWord: (id) => {
    storage.remove(COLLECTIONS.WORDS, id)
    set(state => ({ words: state.words.filter(w => w.id !== id) }))
  },
  wordsByLanguage: (lang) => get().words.filter(w => w.language === lang),

  addNote: (note) => {
    const item = storage.add(COLLECTIONS.NOTES, note)
    set(state => ({ notes: [...state.notes, item] }))
    return item
  },
  updateNote: (id, patch) => {
    const item = storage.update(COLLECTIONS.NOTES, id, patch)
    set(state => ({ notes: state.notes.map(n => (n.id === id ? item : n)) }))
    return item
  },
  removeNote: (id) => {
    storage.remove(COLLECTIONS.NOTES, id)
    set(state => ({ notes: state.notes.filter(n => n.id !== id) }))
  },
  notesByLanguage: (lang) => get().notes.filter(n => n.language === lang),

  addGrammarEntry: (entry) => {
    const item = storage.add(COLLECTIONS.GRAMMAR_ENTRIES, entry)
    set(state => ({ grammarEntries: [...state.grammarEntries, item] }))
    return item
  },
  updateGrammarEntry: (id, patch) => {
    const item = storage.update(COLLECTIONS.GRAMMAR_ENTRIES, id, patch)
    set(state => ({ grammarEntries: state.grammarEntries.map(e => (e.id === id ? item : e)) }))
    return item
  },
  removeGrammarEntry: (id) => {
    storage.remove(COLLECTIONS.GRAMMAR_ENTRIES, id)
    set(state => ({ grammarEntries: state.grammarEntries.filter(e => e.id !== id) }))
  },
  grammarByLanguage: (lang) => get().grammarEntries.filter(e => e.language === lang),

  addConjugation: (verb) => {
    const item = storage.add(COLLECTIONS.CONJUGATIONS, verb)
    set(state => ({ conjugations: [...state.conjugations, item] }))
    return item
  },
  updateConjugation: (id, patch) => {
    const item = storage.update(COLLECTIONS.CONJUGATIONS, id, patch)
    set(state => ({ conjugations: state.conjugations.map(c => (c.id === id ? item : c)) }))
    return item
  },
  removeConjugation: (id) => {
    storage.remove(COLLECTIONS.CONJUGATIONS, id)
    set(state => ({ conjugations: state.conjugations.filter(c => c.id !== id) }))
  },

  addReadingEntry: (entry) => {
    const item = storage.add(COLLECTIONS.READING_LOG, entry)
    set(state => ({ readingLog: [...state.readingLog, item] }))
    return item
  },
  updateReadingEntry: (id, patch) => {
    const item = storage.update(COLLECTIONS.READING_LOG, id, patch)
    set(state => ({ readingLog: state.readingLog.map(r => (r.id === id ? item : r)) }))
    return item
  },
  removeReadingEntry: (id) => {
    storage.remove(COLLECTIONS.READING_LOG, id)
    set(state => ({ readingLog: state.readingLog.filter(r => r.id !== id) }))
  },
  readingByLanguage: (lang) => get().readingLog.filter(r => r.language === lang),
}))

// ─── Högskoleprov ────────────────────────────────────────────────────────────

export const useHPStore = create((set, get) => ({
  sessions:  storage.get(COLLECTIONS.HP_SESSIONS),
  hpExams:   storage.get(COLLECTIONS.HP_EXAMS),
  examDate:  localStorage.getItem('hub:examDate') ?? null,

  setExamDate: (date) => {
    if (date) localStorage.setItem('hub:examDate', date)
    else localStorage.removeItem('hub:examDate')
    set({ examDate: date || null })
  },

  addSession: (session) => {
    const item = storage.add(COLLECTIONS.HP_SESSIONS, session)
    set(state => ({ sessions: [...state.sessions, item] }))
    if (session.year && session.season) get().addHpExam(session.year, session.season)
    return item
  },
  updateSession: (id, patch) => {
    const item = storage.update(COLLECTIONS.HP_SESSIONS, id, patch)
    set(state => ({ sessions: state.sessions.map(s => (s.id === id ? item : s)) }))
    return item
  },
  removeSession: (id) => {
    storage.remove(COLLECTIONS.HP_SESSIONS, id)
    set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }))
  },

  addHpExam: (year, season) => {
    const existing = get().hpExams.find(e => e.year === year && e.season === season)
    if (existing) return existing
    const item = storage.add(COLLECTIONS.HP_EXAMS, { year, season, completed: [] })
    set(state => ({ hpExams: [...state.hpExams, item] }))
    return item
  },
  toggleHpExamSection: (examId, section) => {
    const exam = get().hpExams.find(e => e.id === examId)
    if (!exam) return
    const completed = exam.completed.includes(section)
      ? exam.completed.filter(s => s !== section)
      : [...exam.completed, section]
    const item = storage.update(COLLECTIONS.HP_EXAMS, examId, { completed })
    set(state => ({ hpExams: state.hpExams.map(e => (e.id === examId ? item : e)) }))
  },
  removeHpExam: (id) => {
    storage.remove(COLLECTIONS.HP_EXAMS, id)
    set(state => ({ hpExams: state.hpExams.filter(e => e.id !== id) }))
  },

  daysUntilExam: () => {
    const target = get().examDate
    if (!target) return null
    const diff = Math.ceil((new Date(target) - new Date()) / 86400000)
    return diff > 0 ? diff : null
  },
}))

// ─── Engagemang ───────────────────────────────────────────────────────────────

export const useEngagemangStore = create((set, get) => ({
  organizations: storage.get(COLLECTIONS.ORGANIZATIONS),
  platforms:     storage.get(COLLECTIONS.PLATFORMS),
  orgTodos:      storage.get(COLLECTIONS.ORG_TODOS),
  orgGoals:      storage.get(COLLECTIONS.ORG_GOALS),
  contacts:      storage.get(COLLECTIONS.ORG_CONTACTS),
  orgLogs:       storage.get(COLLECTIONS.ORG_LOGS),

  addOrganization: (org) => {
    const item = storage.add(COLLECTIONS.ORGANIZATIONS, org)
    set(state => ({ organizations: [...state.organizations, item] }))
    return item
  },
  updateOrganization: (id, patch) => {
    const item = storage.update(COLLECTIONS.ORGANIZATIONS, id, patch)
    set(state => ({ organizations: state.organizations.map(o => (o.id === id ? item : o)) }))
    return item
  },
  removeOrganization: (id) => {
    storage.remove(COLLECTIONS.ORGANIZATIONS, id)
    const orgTodos  = storage.get(COLLECTIONS.ORG_TODOS).filter(t => t.orgId !== id)
    const orgGoals  = storage.get(COLLECTIONS.ORG_GOALS).filter(g => g.orgId !== id)
    const contacts  = storage.get(COLLECTIONS.ORG_CONTACTS).filter(c => c.orgId !== id)
    const orgLogs   = storage.get(COLLECTIONS.ORG_LOGS).filter(l => l.orgId !== id)
    storage.set(COLLECTIONS.ORG_TODOS, orgTodos)
    storage.set(COLLECTIONS.ORG_GOALS, orgGoals)
    storage.set(COLLECTIONS.ORG_CONTACTS, contacts)
    storage.set(COLLECTIONS.ORG_LOGS, orgLogs)
    set(state => ({ organizations: state.organizations.filter(o => o.id !== id), orgTodos, orgGoals, contacts, orgLogs }))
  },

  addPlatform: (platform) => {
    const item = storage.add(COLLECTIONS.PLATFORMS, platform)
    set(state => ({ platforms: [...state.platforms, item] }))
    return item
  },
  updatePlatform: (id, patch) => {
    const item = storage.update(COLLECTIONS.PLATFORMS, id, patch)
    set(state => ({ platforms: state.platforms.map(p => (p.id === id ? item : p)) }))
    return item
  },
  removePlatform: (id) => {
    storage.remove(COLLECTIONS.PLATFORMS, id)
    set(state => ({ platforms: state.platforms.filter(p => p.id !== id) }))
  },

  addOrgTodo: (orgId, todo) => {
    const item = storage.add(COLLECTIONS.ORG_TODOS, { ...todo, orgId, done: false })
    set(state => ({ orgTodos: [...state.orgTodos, item] }))
    return item
  },
  updateOrgTodo: (id, patch) => {
    const item = storage.update(COLLECTIONS.ORG_TODOS, id, patch)
    set(state => ({ orgTodos: state.orgTodos.map(t => (t.id === id ? item : t)) }))
    return item
  },
  removeOrgTodo: (id) => {
    storage.remove(COLLECTIONS.ORG_TODOS, id)
    set(state => ({ orgTodos: state.orgTodos.filter(t => t.id !== id) }))
  },
  todosByOrg: (orgId) => get().orgTodos.filter(t => t.orgId === orgId),

  addOrgGoal: (orgId, goal) => {
    const item = storage.add(COLLECTIONS.ORG_GOALS, { ...goal, orgId, progress: 0, done: false })
    set(state => ({ orgGoals: [...state.orgGoals, item] }))
    return item
  },
  updateOrgGoal: (id, patch) => {
    const item = storage.update(COLLECTIONS.ORG_GOALS, id, patch)
    set(state => ({ orgGoals: state.orgGoals.map(g => (g.id === id ? item : g)) }))
    return item
  },
  removeOrgGoal: (id) => {
    storage.remove(COLLECTIONS.ORG_GOALS, id)
    set(state => ({ orgGoals: state.orgGoals.filter(g => g.id !== id) }))
  },
  goalsByOrg: (orgId) => get().orgGoals.filter(g => g.orgId === orgId),

  // ─── Kontakter ────────────────────────────────────────────────────────────

  addContact: (orgId, contact) => {
    const item = storage.add(COLLECTIONS.ORG_CONTACTS, { ...contact, orgId })
    set(state => ({ contacts: [...state.contacts, item] }))
    return item
  },
  updateContact: (id, patch) => {
    const item = storage.update(COLLECTIONS.ORG_CONTACTS, id, patch)
    set(state => ({ contacts: state.contacts.map(c => c.id === id ? item : c) }))
    return item
  },
  removeContact: (id) => {
    storage.remove(COLLECTIONS.ORG_CONTACTS, id)
    set(state => ({ contacts: state.contacts.filter(c => c.id !== id) }))
  },

  // ─── Aktivitetslogg ───────────────────────────────────────────────────────

  addOrgLog: (orgId, { text, date }) => {
    const item = storage.add(COLLECTIONS.ORG_LOGS, { orgId, text, date })
    set(state => ({ orgLogs: [...state.orgLogs, item] }))
    return item
  },
  removeOrgLog: (id) => {
    storage.remove(COLLECTIONS.ORG_LOGS, id)
    set(state => ({ orgLogs: state.orgLogs.filter(l => l.id !== id) }))
  },

  // ─── Plattformsaktiviteter (inbäddade i platform.activities[]) ────────────

  addPlatformActivity: (platformId, activity) => {
    const p = get().platforms.find(p => p.id === platformId)
    if (!p) return null
    const newAct = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      ...activity,
    }
    const updated = storage.update(COLLECTIONS.PLATFORMS, platformId, {
      activities: [...(p.activities ?? []), newAct],
    })
    set(state => ({ platforms: state.platforms.map(pl => pl.id === platformId ? updated : pl) }))
    return newAct
  },
  removePlatformActivity: (platformId, activityId) => {
    const p = get().platforms.find(p => p.id === platformId)
    if (!p) return
    const activities = (p.activities ?? []).filter(a => a.id !== activityId)
    const updated = storage.update(COLLECTIONS.PLATFORMS, platformId, { activities })
    set(state => ({ platforms: state.platforms.map(pl => pl.id === platformId ? updated : pl) }))
  },
}))

// ─── Planering ────────────────────────────────────────────────────────────────

const DEFAULT_EPOCH_CATS = [
  { id: 'utbildning', name: 'Utbildning',  color: '#7c72f5', order: 0 },
  { id: 'arbete',     name: 'Arbete',      color: '#22d3ee', order: 1 },
  { id: 'projekt',    name: 'Projekt',     color: '#f97316', order: 2 },
]

function seedCategories() {
  const existing = storage.get(COLLECTIONS.EPOCH_CATS)
  if (existing.length > 0) return existing
  storage.set(COLLECTIONS.EPOCH_CATS, DEFAULT_EPOCH_CATS)
  return DEFAULT_EPOCH_CATS
}

export const usePlaneringsStore = create((set) => ({
  epochs:     storage.get(COLLECTIONS.EPOCHS),
  epochCats:  seedCategories(),
  subEpochs:  storage.get(COLLECTIONS.EPOCH_SUBS),

  addEpoch: (epoch) => {
    const item = storage.add(COLLECTIONS.EPOCHS, epoch)
    set(state => ({ epochs: [...state.epochs, item] }))
    return item
  },
  updateEpoch: (id, patch) => {
    const item = storage.update(COLLECTIONS.EPOCHS, id, patch)
    set(state => ({ epochs: state.epochs.map(e => (e.id === id ? item : e)) }))
    return item
  },
  removeEpoch: (id) => {
    storage.remove(COLLECTIONS.EPOCHS, id)
    // Ta bort alla delepoker som tillhör denna epok
    const remaining = storage.get(COLLECTIONS.EPOCH_SUBS).filter(s => s.epochId !== id)
    storage.set(COLLECTIONS.EPOCH_SUBS, remaining)
    set(state => ({ epochs: state.epochs.filter(e => e.id !== id), subEpochs: remaining }))
  },

  addSubEpoch: (sub) => {
    const item = storage.add(COLLECTIONS.EPOCH_SUBS, sub)
    set(state => ({ subEpochs: [...state.subEpochs, item] }))
    return item
  },
  updateSubEpoch: (id, patch) => {
    const item = storage.update(COLLECTIONS.EPOCH_SUBS, id, patch)
    set(state => ({ subEpochs: state.subEpochs.map(s => (s.id === id ? item : s)) }))
    return item
  },
  removeSubEpoch: (id) => {
    storage.remove(COLLECTIONS.EPOCH_SUBS, id)
    set(state => ({ subEpochs: state.subEpochs.filter(s => s.id !== id) }))
  },

  addEpochCat: (cat) => {
    const id   = cat.name.toLowerCase().replace(/[^a-zåäö0-9]/gi, '_') + '_' + Date.now().toString(36)
    const item = { ...cat, id, order: storage.get(COLLECTIONS.EPOCH_CATS).length }
    const cats = [...storage.get(COLLECTIONS.EPOCH_CATS), item]
    storage.set(COLLECTIONS.EPOCH_CATS, cats)
    set({ epochCats: cats })
    return item
  },
  updateEpochCat: (id, patch) => {
    const cats = storage.get(COLLECTIONS.EPOCH_CATS).map(c => c.id === id ? { ...c, ...patch } : c)
    storage.set(COLLECTIONS.EPOCH_CATS, cats)
    set({ epochCats: cats })
  },
  removeEpochCat: (id) => {
    const cats = storage.get(COLLECTIONS.EPOCH_CATS).filter(c => c.id !== id)
    storage.set(COLLECTIONS.EPOCH_CATS, cats)
    set({ epochCats: cats })
  },
}))

// ─── Att göra ────────────────────────────────────────────────────────────────

export const useTodoStore = create((set, get) => ({
  todos: storage.get(COLLECTIONS.TODOS),

  addTodo: (priority, text) => {
    if (!text.trim()) return null
    const item = storage.add(COLLECTIONS.TODOS, { text: text.trim(), priority, done: false })
    set(state => ({ todos: [...state.todos, item] }))
    return item
  },
  toggleTodo: (id) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return
    const item = storage.update(COLLECTIONS.TODOS, id, { done: !todo.done })
    set(state => ({ todos: state.todos.map(t => t.id === id ? item : t) }))
  },
  updateTodo: (id, text) => {
    const item = storage.update(COLLECTIONS.TODOS, id, { text })
    set(state => ({ todos: state.todos.map(t => t.id === id ? item : t) }))
  },
  removeTodo: (id) => {
    storage.remove(COLLECTIONS.TODOS, id)
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))
  },
}))

// ─── Läsning ─────────────────────────────────────────────────────────────────

function genWorkId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export const useLasningStore = create((set, get) => ({
  categories: storage.get(COLLECTIONS.READING_CATEGORIES),

  // ── Kategorier ──────────────────────────────────────────────────────────

  addCategory: ({ name, color }) => {
    const item = storage.add(COLLECTIONS.READING_CATEGORIES, { name, color, works: [] })
    set(state => ({ categories: [...state.categories, item] }))
    return item
  },
  updateCategory: (id, patch) => {
    const item = storage.update(COLLECTIONS.READING_CATEGORIES, id, patch)
    set(state => ({ categories: state.categories.map(c => c.id === id ? item : c) }))
    return item
  },
  removeCategory: (id) => {
    storage.remove(COLLECTIONS.READING_CATEGORIES, id)
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }))
  },

  // ── Verk ────────────────────────────────────────────────────────────────

  addWork: (categoryId, work) => {
    const cat = get().categories.find(c => c.id === categoryId)
    if (!cat) return null
    const newWork = {
      id: genWorkId(),
      addedAt: new Date().toISOString(),
      status: 'vill läsa',
      ...work,
    }
    const updated = storage.update(COLLECTIONS.READING_CATEGORIES, categoryId, {
      works: [...(cat.works ?? []), newWork],
    })
    set(state => ({ categories: state.categories.map(c => c.id === categoryId ? updated : c) }))
    return newWork
  },
  updateWork: (categoryId, workId, patch) => {
    const cat = get().categories.find(c => c.id === categoryId)
    if (!cat) return
    const works = (cat.works ?? []).map(w => w.id === workId ? { ...w, ...patch } : w)
    const updated = storage.update(COLLECTIONS.READING_CATEGORIES, categoryId, { works })
    set(state => ({ categories: state.categories.map(c => c.id === categoryId ? updated : c) }))
  },
  removeWork: (categoryId, workId) => {
    const cat = get().categories.find(c => c.id === categoryId)
    if (!cat) return
    const works = (cat.works ?? []).filter(w => w.id !== workId)
    const updated = storage.update(COLLECTIONS.READING_CATEGORIES, categoryId, { works })
    set(state => ({ categories: state.categories.map(c => c.id === categoryId ? updated : c) }))
  },
}))

// ─── Vardagskarta ─────────────────────────────────────────────────────────────
// categories: [{ id, name, color }]
// events:     [{ id, title, categoryId, day (0=Mån…6=Sön), startTime, endTime }]
// somedayItems: [{ id, title, categoryId }]

export const useVardagsStore = create((set) => ({
  categories:   storage.get(COLLECTIONS.VARDAGS_CATEGORIES),
  events:       storage.get(COLLECTIONS.VARDAGS_EVENTS),
  somedayItems: storage.get(COLLECTIONS.VARDAGS_SOMEDAY),

  addCategory: ({ name, color }) => {
    const item = storage.add(COLLECTIONS.VARDAGS_CATEGORIES, { name, color })
    set(state => ({ categories: [...state.categories, item] }))
    return item
  },
  updateCategory: (id, patch) => {
    const item = storage.update(COLLECTIONS.VARDAGS_CATEGORIES, id, patch)
    set(state => ({ categories: state.categories.map(c => c.id === id ? item : c) }))
    return item
  },
  removeCategory: (id) => {
    storage.remove(COLLECTIONS.VARDAGS_CATEGORIES, id)
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }))
  },

  addEvent: (event) => {
    const item = storage.add(COLLECTIONS.VARDAGS_EVENTS, event)
    set(state => ({ events: [...state.events, item] }))
    return item
  },
  updateEvent: (id, patch) => {
    const item = storage.update(COLLECTIONS.VARDAGS_EVENTS, id, patch)
    set(state => ({ events: state.events.map(e => e.id === id ? item : e) }))
    return item
  },
  removeEvent: (id) => {
    storage.remove(COLLECTIONS.VARDAGS_EVENTS, id)
    set(state => ({ events: state.events.filter(e => e.id !== id) }))
  },

  addSomedayItem: ({ title, categoryId }) => {
    const item = storage.add(COLLECTIONS.VARDAGS_SOMEDAY, { title, categoryId })
    set(state => ({ somedayItems: [...state.somedayItems, item] }))
    return item
  },
  removeSomedayItem: (id) => {
    storage.remove(COLLECTIONS.VARDAGS_SOMEDAY, id)
    set(state => ({ somedayItems: state.somedayItems.filter(i => i.id !== id) }))
  },
}))
