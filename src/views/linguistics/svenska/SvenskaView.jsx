import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

const STYLE_LEVELS = ['Ålderdomligt', 'Formellt', 'Neutralt', 'Talspråk']

export default function SvenskaView() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ word: '', definition: '', etymology: '', styleLevel: 'Formellt', hpRelevant: false, tags: '' })
  const [filter, setFilter] = useState('alla')

  const { words, addWord } = useLinguisticsStore()
  const svWords = words.filter(w => w.language === 'svenska')
  const filtered = filter === 'hp' ? svWords.filter(w => w.hpRelevant) : svWords

  function handleAdd(e) {
    e.preventDefault()
    addWord({
      ...form,
      language: 'svenska',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setForm({ word: '', definition: '', etymology: '', styleLevel: 'Formellt', hpRelevant: false, tags: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted font-mono">{svWords.length} ord</p>
          <span className="text-dim">·</span>
          <button
            onClick={() => setFilter(f => f === 'alla' ? 'hp' : 'alla')}
            className={[
              'rounded-md px-2 py-0.5 text-xs transition-all',
              filter === 'hp' ? 'bg-amber/10 text-amber' : 'text-muted hover:text-text',
            ].join(' ')}
          >
            HP-relevanta: {svWords.filter(w => w.hpRelevant).length}
          </button>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1">
          <Plus size={13} /> Nytt ord
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 rounded-2xl border border-border bg-surface p-5 space-y-3">
          <p className="text-sm font-medium text-text">Lägg till ord</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ord" value={form.word} onChange={v => setForm(f => ({ ...f, word: v }))} required />
            <Field label="Etymologi" value={form.etymology} onChange={v => setForm(f => ({ ...f, etymology: v }))} />
          </div>
          <Field label="Definition" value={form.definition} onChange={v => setForm(f => ({ ...f, definition: v }))} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Stilnivå</label>
              <select
                className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none"
                value={form.styleLevel}
                onChange={e => setForm(f => ({ ...f, styleLevel: e.target.value }))}
              >
                {STYLE_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hpRelevant}
                  onChange={e => setForm(f => ({ ...f, hpRelevant: e.target.checked }))}
                  className="accent-amber"
                />
                <span className="text-sm text-text">HP-relevant (ORD-delen)</span>
              </label>
            </div>
          </div>
          <Field label="Taggar" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="verb, substantiv…" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map(w => (
          <div key={w.id} className="flex items-start justify-between rounded-xl border border-border bg-surface p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-accent">{w.word}</span>
                {w.hpRelevant && (
                  <span className="rounded-md bg-amber/10 px-1.5 py-0.5 text-xs text-amber">HP</span>
                )}
                {w.styleLevel && (
                  <span className="text-xs text-dim">{w.styleLevel}</span>
                )}
              </div>
              {w.etymology && <p className="mt-0.5 text-xs text-muted">← {w.etymology}</p>}
              <p className="mt-1 text-sm text-text">{w.definition}</p>
            </div>
            <div className="ml-3 flex flex-wrap gap-1">
              {(w.tags ?? []).map(tag => (
                <span key={tag} className="rounded-md bg-surface2 px-1.5 py-0.5 text-xs text-muted">{tag}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted">
              {filter === 'hp' ? 'Inga HP-taggade ord ännu.' : 'Inga ord ännu.'}
            </p>
          </div>
        )}
      </div>
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
