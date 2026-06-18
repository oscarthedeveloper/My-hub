import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

export default function EngelskaView() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ word: '', definition: '', examples: '', register: 'Formellt', tags: '' })

  const { words, addWord } = useLinguisticsStore()
  const enWords = words.filter(w => w.language === 'engelska')

  function handleAdd(e) {
    e.preventDefault()
    addWord({
      ...form,
      language: 'engelska',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setForm({ word: '', definition: '', examples: '', register: 'Formellt', tags: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted font-mono">{enWords.length} ord</p>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1">
          <Plus size={13} /> Nytt ord
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 rounded-2xl border border-border bg-surface p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Word" value={form.word} onChange={v => setForm(f => ({ ...f, word: v }))} required />
            <div>
              <label className="mb-1 block text-xs text-muted">Register</label>
              <select
                className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none"
                value={form.register}
                onChange={e => setForm(f => ({ ...f, register: e.target.value }))}
              >
                {['Formellt', 'Neutralt', 'Informellt', 'Arkaiskt'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <Field label="Definition" value={form.definition} onChange={v => setForm(f => ({ ...f, definition: v }))} required />
          <Field label="Example" value={form.examples} onChange={v => setForm(f => ({ ...f, examples: v }))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {enWords.map(w => (
          <div key={w.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-amber">{w.word}</span>
              {w.register && <span className="text-xs text-dim">{w.register}</span>}
            </div>
            <p className="mt-1 text-sm text-text">{w.definition}</p>
            {w.examples && <p className="mt-1 text-xs italic text-muted">"{w.examples}"</p>}
          </div>
        ))}
        {enWords.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted">No words yet.</p>
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
