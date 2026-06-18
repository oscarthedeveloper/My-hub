import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

const TYPES = ['Substantiv', 'Verb', 'Adjektiv', 'Adverb', 'Fras', 'Grammatik', 'Övrigt']

export default function ItalianskaView() {
  const [tab, setTab] = useState('words')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ word: '', translation: '', definition: '', type: 'Substantiv', examples: '', tags: '' })

  const { words, notes, addWord, addNote } = useLinguisticsStore()
  const itWords = words.filter(w => w.language === 'italienska')
  const itNotes = notes.filter(n => n.language === 'italienska')

  function handleAdd(e) {
    e.preventDefault()
    addWord({
      ...form,
      definition: form.definition || form.translation,
      language: 'italienska',
      tags: [form.type, ...form.tags.split(',').map(t => t.trim())].filter(Boolean),
    })
    setForm({ word: '', translation: '', definition: '', type: 'Substantiv', examples: '', tags: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        {['words', 'grammar'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'rounded-lg px-3 py-1.5 text-sm transition-all',
              tab === t ? 'bg-surface2 text-cyan ring-1 ring-border' : 'text-muted hover:text-text',
            ].join(' ')}
          >
            {t === 'words' ? `Ordförråd (${itWords.length})` : `Grammatik (${itNotes.length})`}
          </button>
        ))}
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1 ml-auto">
          <Plus size={13} /> {tab === 'words' ? 'Nytt ord' : 'Ny not'}
        </button>
      </div>

      {tab === 'words' && (
        <div>
          {showForm && (
            <form onSubmit={handleAdd} className="mb-5 rounded-2xl border border-border bg-surface p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ord (ita.)" value={form.word} onChange={v => setForm(f => ({ ...f, word: v }))} required />
                <Field label="Översättning (sv.)" value={form.translation} onChange={v => setForm(f => ({ ...f, translation: v }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted">Ordklass</label>
                  <select
                    className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <Field label="Exempel" value={form.examples} onChange={v => setForm(f => ({ ...f, examples: v }))} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Spara</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {itWords.map(w => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-cyan">{w.word}</span>
                  <span className="text-dim">→</span>
                  <span className="text-sm text-text">{w.definition}</span>
                </div>
                <span className="text-xs text-muted">{(w.tags ?? [])[0]}</span>
              </div>
            ))}
            {itWords.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted">Inga ord ännu.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'grammar' && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">Grammatikanteckningar kommer snart.</p>
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
