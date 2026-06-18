import { useState } from 'react'
import { Plus, BookMarked, FileText, List } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

const CATEGORIES = ['Grammatik', 'Ljudlära', 'Morfologi', 'Syntax', 'Ordförråd', 'Texter', 'Övrigt']

const SUB_TABS = [
  { id: 'words', label: 'Ordförråd', icon: List },
  { id: 'notes', label: 'Anteckningar', icon: FileText },
  { id: 'reading', label: 'Läslogg', icon: BookMarked },
]

export default function FornsvenskaView() {
  const [tab, setTab] = useState('words')
  const [showWordForm, setShowWordForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [wordForm, setWordForm] = useState({ word: '', definition: '', etymology: '', examples: '', tags: '' })
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: 'Grammatik' })

  const { words, notes, addWord, addNote } = useLinguisticsStore()
  const fsWords = words.filter(w => w.language === 'fornsvenska')
  const fsNotes = notes.filter(n => n.language === 'fornsvenska')

  function handleAddWord(e) {
    e.preventDefault()
    addWord({
      ...wordForm,
      language: 'fornsvenska',
      tags: wordForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setWordForm({ word: '', definition: '', etymology: '', examples: '', tags: '' })
    setShowWordForm(false)
  }

  function handleAddNote(e) {
    e.preventDefault()
    addNote({ ...noteForm, language: 'fornsvenska' })
    setNoteForm({ title: '', content: '', category: 'Grammatik' })
    setShowNoteForm(false)
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 flex gap-1 w-fit">
        {SUB_TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all',
                tab === t.id ? 'bg-surface2 text-green ring-1 ring-border' : 'text-muted hover:text-text',
              ].join(' ')}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Ordförråd ── */}
      {tab === 'words' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted font-mono">{fsWords.length} ord</p>
            <button onClick={() => setShowWordForm(s => !s)} className="btn-primary flex items-center gap-1">
              <Plus size={13} /> Nytt ord
            </button>
          </div>

          {showWordForm && (
            <form onSubmit={handleAddWord} className="mb-5 rounded-2xl border border-border bg-surface p-5 space-y-3">
              <p className="text-sm font-medium text-text">Lägg till fornsvenskt ord</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ord" value={wordForm.word} onChange={v => setWordForm(f => ({ ...f, word: v }))} required />
                <Field label="Etymologi" value={wordForm.etymology} onChange={v => setWordForm(f => ({ ...f, etymology: v }))} />
              </div>
              <Field label="Definition" value={wordForm.definition} onChange={v => setWordForm(f => ({ ...f, definition: v }))} required />
              <Field label="Exempel" value={wordForm.examples} onChange={v => setWordForm(f => ({ ...f, examples: v }))} placeholder="Forn. mening…" />
              <Field label="Taggar (kommaseparerade)" value={wordForm.tags} onChange={v => setWordForm(f => ({ ...f, tags: v }))} placeholder="substantiv, maskulinum…" />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary">Spara</button>
                <button type="button" onClick={() => setShowWordForm(false)} className="btn-ghost">Avbryt</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {fsWords.map(w => (
              <div key={w.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-medium text-green">{w.word}</span>
                    {w.etymology && (
                      <span className="ml-2 text-xs text-muted">← {w.etymology}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(w.tags ?? []).map(tag => (
                      <span key={tag} className="rounded-md bg-surface2 px-1.5 py-0.5 text-xs text-muted">{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-text">{w.definition}</p>
                {w.examples && <p className="mt-1 text-xs italic text-muted">"{w.examples}"</p>}
              </div>
            ))}
            {fsWords.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted">Inga ord ännu. Börja bygga ditt fornsvenska lexikon.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Anteckningar ── */}
      {tab === 'notes' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted font-mono">{fsNotes.length} anteckningar</p>
            <button onClick={() => setShowNoteForm(s => !s)} className="btn-primary flex items-center gap-1">
              <Plus size={13} /> Ny anteckning
            </button>
          </div>

          {showNoteForm && (
            <form onSubmit={handleAddNote} className="mb-5 rounded-2xl border border-border bg-surface p-5 space-y-3">
              <p className="text-sm font-medium text-text">Ny anteckning</p>
              <Field label="Titel" value={noteForm.title} onChange={v => setNoteForm(f => ({ ...f, title: v }))} required />
              <div>
                <label className="mb-1 block text-xs text-muted">Kategori</label>
                <select
                  className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none"
                  value={noteForm.category}
                  onChange={e => setNoteForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Innehåll</label>
                <textarea
                  className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text placeholder-dim outline-none focus:border-accent/40"
                  rows={6}
                  value={noteForm.content}
                  onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Dina anteckningar…"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Spara</button>
                <button type="button" onClick={() => setShowNoteForm(false)} className="btn-ghost">Avbryt</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 gap-3">
            {fsNotes.map(note => (
              <div key={note.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-sm text-text">{note.title}</h3>
                  <span className="rounded-md bg-green/10 px-2 py-0.5 text-xs text-green">{note.category}</span>
                </div>
                <p className="whitespace-pre-wrap text-xs text-muted line-clamp-4">{note.content}</p>
                <p className="mt-2 text-xs text-dim">{new Date(note.createdAt).toLocaleDateString('sv-SE')}</p>
              </div>
            ))}
            {fsNotes.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted">Inga anteckningar ännu.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Läslogg ── */}
      {tab === 'reading' && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">Läslogg kommer snart — spåra läromedel och progression.</p>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <input
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}
