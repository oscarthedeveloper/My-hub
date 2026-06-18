import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search, X, Trash2 } from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import { LANG_CONFIG } from '../LanguageLayout'
import LinkedDocsSection from '@/components/LinkedDocsSection'

// Language-specific word field configs
const WORD_FIELDS = {
  fornsvenska: [
    { key: 'word',       label: 'Fornsvenskt ord',    required: true  },
    { key: 'definition', label: 'Betydelse (sv)',      required: true  },
    { key: 'etymology',  label: 'Etymologi',           required: false },
    { key: 'wordClass',  label: 'Ordklass',            required: false, type: 'select',
      options: ['substantiv','verb','adjektiv','adverb','pronomen','preposition','konjunktion','interjektion'] },
    { key: 'examples',   label: 'Exempelmening',       required: false },
    { key: 'tags',       label: 'Taggar (komma)',       required: false },
  ],
  svenska: [
    { key: 'word',       label: 'Ord',                 required: true  },
    { key: 'definition', label: 'Betydelse',           required: true  },
    { key: 'synonyms',   label: 'Synonymer',           required: false },
    { key: 'hpSection',  label: 'HP-sektion',          required: false, type: 'select',
      options: ['—','ORD','LÄS','DTK'] },
    { key: 'examples',   label: 'Exempelmening',       required: false },
    { key: 'tags',       label: 'Taggar (komma)',       required: false },
  ],
  italienska: [
    { key: 'word',       label: 'Italienskt ord',      required: true  },
    { key: 'definition', label: 'Översättning (sv)',   required: true  },
    { key: 'gender',     label: 'Genus',               required: false, type: 'select',
      options: ['—','maskulinum (il)','femininum (la)','maskulinum (lo)'] },
    { key: 'plural',     label: 'Pluralis',            required: false },
    { key: 'wordClass',  label: 'Ordklass',            required: false, type: 'select',
      options: ['substantiv','verb','adjektiv','adverb','pronomen','preposition','fras'] },
    { key: 'examples',   label: 'Exempelmening',       required: false },
    { key: 'tags',       label: 'Taggar (komma)',       required: false },
  ],
  engelska: [
    { key: 'word',       label: 'Ord',                 required: true  },
    { key: 'definition', label: 'Definition',          required: true  },
    { key: 'synonyms',   label: 'Synonymer',           required: false },
    { key: 'wordClass',  label: 'Ordklass',            required: false, type: 'select',
      options: ['noun','verb','adjective','adverb','phrase','idiom'] },
    { key: 'examples',   label: 'Example sentence',    required: false },
    { key: 'tags',       label: 'Tags (comma)',         required: false },
  ],
}

function emptyForm(lang) {
  return Object.fromEntries((WORD_FIELDS[lang] ?? []).map(f => [f.key, '']))
}

export default function WordsView() {
  const { lang } = useParams()
  const config = LANG_CONFIG[lang] ?? {}
  const fields = WORD_FIELDS[lang] ?? []

  const { words, addWord, removeWord } = useLinguisticsStore()
  const langWords = useMemo(() => words.filter(w => w.language === lang), [words, lang])

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(() => emptyForm(lang))
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return langWords.filter(w =>
      !q ||
      w.word?.toLowerCase().includes(q) ||
      w.definition?.toLowerCase().includes(q) ||
      (w.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
  }, [langWords, search])

  function handleAdd(e) {
    e.preventDefault()
    const parsed = {
      ...form,
      language: lang,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    addWord(parsed)
    setForm(emptyForm(lang))
    setShowForm(false)
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="w-full rounded-lg border border-border bg-surface2 py-2 pl-8 pr-3 font-mono text-xs text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
            placeholder="sök ord…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text">
              <X size={12} />
            </button>
          )}
        </div>
        <span className="font-mono text-[11px] text-muted ml-auto">
          {filtered.length}/{langWords.length} ord
        </span>
        <button
          onClick={() => setShowForm(s => !s)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={13} /> Nytt ord
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Lägg till ord</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text">
              <X size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(field =>
              field.type === 'select' ? (
                <FormSelect
                  key={field.key}
                  label={field.label}
                  value={form[field.key] ?? ''}
                  onChange={v => setForm(f => ({ ...f, [field.key]: v }))}
                  options={field.options}
                />
              ) : (
                <FormField
                  key={field.key}
                  label={field.label}
                  value={form[field.key] ?? ''}
                  onChange={v => setForm(f => ({ ...f, [field.key]: v }))}
                  required={field.required}
                />
              )
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      {/* ── Word list ── */}
      <div className="space-y-2">
        {filtered.map(w => (
          <WordCard
            key={w.id}
            word={w}
            lang={lang}
            color={config.color}
            onDelete={() => setConfirmDelete(w.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="font-mono text-xs text-muted">
              {langWords.length === 0 ? '// Tomt lexikon — lägg till ditt första ord' : '// Inga träffar'}
            </p>
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-4">Ta bort ordet?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { removeWord(confirmDelete); setConfirmDelete(null) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WordCard({ word, lang, color, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="group rounded-xl border border-border bg-surface transition-colors hover:border-border2"
    >
      <div
        className="flex cursor-pointer items-start gap-3 px-4 py-3"
        onClick={() => setExpanded(s => !s)}
      >
        {/* Word */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium" style={{ color }}>
              {word.word}
            </span>
            {word.wordClass && word.wordClass !== '—' && (
              <span className="font-mono text-[10px] text-muted">{word.wordClass}</span>
            )}
            {word.gender && word.gender !== '—' && (
              <span className="font-mono text-[10px] text-muted">{word.gender}</span>
            )}
            {word.hpSection && word.hpSection !== '—' && (
              <span
                className="rounded px-1.5 py-px font-mono text-[10px]"
                style={{ backgroundColor: color + '18', color }}
              >
                {word.hpSection}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-text">{word.definition}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-end gap-1 shrink-0">
          {(word.tags ?? []).slice(0, 3).map(tag => (
            <span key={tag} className="rounded border border-border font-mono text-[10px] px-1.5 py-px text-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {word.etymology && (
            <p className="font-mono text-xs text-muted">
              <span className="text-dim">etymologi  </span>{word.etymology}
            </p>
          )}
          {word.synonyms && (
            <p className="font-mono text-xs text-muted">
              <span className="text-dim">synonymer  </span>{word.synonyms}
            </p>
          )}
          {word.plural && (
            <p className="font-mono text-xs text-muted">
              <span className="text-dim">plural     </span>{word.plural}
            </p>
          )}
          {word.examples && (
            <p className="font-mono text-xs italic text-muted">"{word.examples}"</p>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex items-center gap-1 font-mono text-[11px] text-muted hover:text-rose transition-colors"
            >
              <Trash2 size={11} /> ta bort
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <select
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
