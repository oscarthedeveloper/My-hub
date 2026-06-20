import { useState, useMemo } from 'react'
import {
  Plus, BookOpen, CheckCircle2, Clock, Trash2, X,
  Pencil, Check, Star, ExternalLink, Package, PackageOpen,
} from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import LinkedDocsSection from '@/components/LinkedDocsSection'

const TEXT_TYPES  = ['Lagtext', 'Religiös text', 'Litteratur', 'Lärobok', 'Ordbok', 'Handskrift', 'Övrigt']
const DIFFICULTIES = ['Nybörjare', 'Medel', 'Avancerad']

const BLANK = {
  title: '', author: '', type: TEXT_TYPES[0], difficulty: DIFFICULTIES[1],
  totalPages: '', currentPage: '', startDate: '',
  acquired: false,
  url: '', edition: '',
  notes: '', reflection: '', rating: 0,
}

// ─── Huvud-vy ─────────────────────────────────────────────────────────────────

export default function LasloggView() {
  const { readingLog, addReadingEntry, updateReadingEntry, removeReadingEntry } = useLinguisticsStore()

  const entries = useMemo(
    () => readingLog
      .filter(r => r.language === 'fornsvenska')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [readingLog]
  )

  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(BLANK)
  const [confirmDel,  setConfirmDel]  = useState(null)

  const inProgress = entries.filter(r => r.status === 'reading')
  const done       = entries.filter(r => r.status === 'done')
  const planned    = entries.filter(r => !r.status || r.status === 'planned')

  function handleAdd(e) {
    e.preventDefault()
    addReadingEntry({
      ...form,
      language:    'fornsvenska',
      status:      'planned',
      totalPages:  form.totalPages  ? parseInt(form.totalPages)  : null,
      currentPage: 0,
      rating:      0,
    })
    setForm(BLANK)
    setShowForm(false)
  }

  function cycleStatus(entry) {
    const next = { planned: 'reading', reading: 'done', done: 'planned' }
    updateReadingEntry(entry.id, { status: next[entry.status ?? 'planned'] ?? 'planned' })
  }

  return (
    <div>
      {/* ── Bifogade dokument ── */}
      <div className="mb-5">
        <LinkedDocsSection language="fornsvenska" view="laslogg" />
      </div>

      {/* ── Stats ── */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCell label="Läser nu"      value={inProgress.length} color="#34d399" />
        <StatCell label="Planerade"     value={planned.length}    color="#d97706" />
        <StatCell label="Avklarade"     value={done.length}       color="#7c72f5" />
        <StatCell
          label="Ej införskaffade"
          value={entries.filter(r => !r.acquired).length}
          color="#e11d48"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">{entries.length} texter</span>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Lägg till text
        </button>
      </div>

      {/* ── Lägg till-formulär ── */}
      {showForm && (
        <EntryForm
          form={form}
          setForm={setForm}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          title="Ny text"
        />
      )}

      {/* ── Läslista per status ── */}
      {[
        { label: 'Läser nu',  items: inProgress, color: '#34d399', icon: BookOpen     },
        { label: 'Planerade', items: planned,    color: '#d97706', icon: Clock        },
        { label: 'Avklarade', items: done,       color: '#7c72f5', icon: CheckCircle2 },
      ].map(section => section.items.length > 0 && (
        <div key={section.label} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <section.icon size={14} style={{ color: section.color }} />
            <span className="font-mono text-[11px] font-medium" style={{ color: section.color }}>
              {section.label}
            </span>
            <span className="font-mono text-[11px] text-muted">({section.items.length})</span>
          </div>
          <div className="space-y-2">
            {section.items.map(entry => (
              <ReadingCard
                key={entry.id}
                entry={entry}
                color={section.color}
                onUpdate={patch => updateReadingEntry(entry.id, patch)}
                onCycleStatus={() => cycleStatus(entry)}
                onDelete={() => setConfirmDel(entry.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {entries.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="font-mono text-xs text-muted">// Läsloggen är tom — lägg till din första text</p>
        </div>
      )}

      {/* Radera-bekräftelse */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-4">Ta bort texten från läsloggen?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { removeReadingEntry(confirmDel); setConfirmDel(null) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(null)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ReadingCard ──────────────────────────────────────────────────────────────

function ReadingCard({ entry, color, onUpdate, onCycleStatus, onDelete }) {
  const [editing,   setEditing]   = useState(false)
  const [editForm,  setEditForm]  = useState(null)
  const [editPage,  setEditPage]  = useState(false)
  const [pageInput, setPageInput] = useState(String(entry.currentPage ?? 0))
  const [expanded,  setExpanded]  = useState(false)

  const pct = entry.totalPages
    ? Math.min(100, Math.round(((entry.currentPage ?? 0) / entry.totalPages) * 100))
    : null

  function startEdit() {
    setEditForm({
      title:      entry.title,
      author:     entry.author     ?? '',
      type:       entry.type       ?? TEXT_TYPES[0],
      difficulty: entry.difficulty ?? DIFFICULTIES[1],
      totalPages: entry.totalPages != null ? String(entry.totalPages) : '',
      startDate:  entry.startDate  ?? '',
      acquired:   entry.acquired   ?? false,
      url:        entry.url        ?? '',
      edition:    entry.edition    ?? '',
      notes:      entry.notes      ?? '',
      reflection: entry.reflection ?? '',
      rating:     entry.rating     ?? 0,
    })
    setEditing(true)
  }

  function handleUpdate(e) {
    e.preventDefault()
    onUpdate({
      ...editForm,
      totalPages: editForm.totalPages ? parseInt(editForm.totalPages) : null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <EntryForm
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        title="Redigera"
        showRating={entry.status === 'done'}
        showReflection
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* ── Huvud-rad ── */}
      <div className="flex items-start gap-3 px-4 py-3">

        {/* Status-toggle */}
        <button
          onClick={onCycleStatus}
          className="mt-0.5 shrink-0 transition-colors"
          style={{ color }}
          title="Ändra status (planerad → läser → avklarad)"
        >
          <BookOpen size={15} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Titel + metadata */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-sm font-medium text-text">{entry.title}</p>
                {/* Förvärvad */}
                <button
                  onClick={() => onUpdate({ acquired: !entry.acquired })}
                  title={entry.acquired ? 'Förvärvad — klicka för att ändra' : 'Ej förvärvad — klicka för att markera'}
                  className={[
                    'flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] transition-all',
                    entry.acquired
                      ? 'bg-green/10 text-green ring-1 ring-green/20 hover:bg-green/20'
                      : 'bg-rose/10 text-rose ring-1 ring-rose/20 hover:bg-rose/20',
                  ].join(' ')}
                >
                  {entry.acquired
                    ? <><Package size={9} /> Förvärvad</>
                    : <><PackageOpen size={9} /> Ej förvärvad</>}
                </button>
                {/* Betyg (om avklarad) */}
                {entry.status === 'done' && entry.rating > 0 && (
                  <StarRating value={entry.rating} readonly />
                )}
              </div>
              {entry.author && <p className="font-mono text-[11px] text-muted">{entry.author}</p>}
              {entry.edition && <p className="font-mono text-[10px] text-dim">{entry.edition}</p>}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded border border-border font-mono text-[10px] px-1.5 py-px text-muted">{entry.type}</span>
              <span className="font-mono text-[10px] text-muted">{entry.difficulty}</span>
              {entry.url && (
                <a href={entry.url} target="_blank" rel="noopener noreferrer"
                  className="rounded p-1 text-muted hover:text-text transition-colors">
                  <ExternalLink size={12} />
                </a>
              )}
              <button onClick={startEdit} className="rounded p-1 text-muted hover:text-text transition-colors">
                <Pencil size={12} />
              </button>
              <button onClick={onDelete} className="rounded p-1 text-muted hover:text-rose transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Progress-bar */}
          {entry.totalPages && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editPage ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        className="w-16 rounded border border-border bg-surface2 px-1.5 py-0.5 font-mono text-xs text-text outline-none focus:border-accent/40"
                        value={pageInput}
                        onChange={e => setPageInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            onUpdate({ currentPage: parseInt(pageInput) || 0 })
                            setEditPage(false)
                          }
                          if (e.key === 'Escape') setEditPage(false)
                        }}
                      />
                      <span className="font-mono text-[11px] text-muted">/ {entry.totalPages}</span>
                      <button
                        onClick={() => { onUpdate({ currentPage: parseInt(pageInput) || 0 }); setEditPage(false) }}
                        className="font-mono text-[11px] text-accent hover:underline"
                      >ok</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPageInput(String(entry.currentPage ?? 0)); setEditPage(true) }}
                      className="font-mono text-[11px] text-muted hover:text-text transition-colors"
                    >
                      s. {entry.currentPage ?? 0} / {entry.totalPages}
                    </button>
                  )}
                </div>
                {pct !== null && (
                  <span className="font-mono text-[11px]" style={{ color }}>{pct}%</span>
                )}
              </div>
              <div className="h-px w-full bg-border">
                <div className="h-px transition-all" style={{ width: `${pct ?? 0}%`, backgroundColor: color }} />
              </div>
            </div>
          )}

          {/* Anteckningar — klickbar expand */}
          {(entry.notes || entry.reflection) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 font-mono text-[10px] text-dim hover:text-muted transition-colors"
            >
              {expanded ? '▲ dölj' : '▼ anteckningar'}
            </button>
          )}
          {expanded && (
            <div className="mt-2 space-y-2">
              {entry.notes && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim mb-0.5">Förhandsnotes</p>
                  <p className="font-sans text-xs italic text-muted">{entry.notes}</p>
                </div>
              )}
              {entry.reflection && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim mb-0.5">Reflektion</p>
                  <p className="font-sans text-xs text-text">{entry.reflection}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── EntryForm ────────────────────────────────────────────────────────────────

function EntryForm({ form, setForm, onSubmit, onCancel, title, showRating = false, showReflection = false }) {
  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-text">{title}</p>
        <button type="button" onClick={onCancel} className="text-muted hover:text-text"><X size={15} /></button>
      </div>

      {/* Rad 1: Titel, Författare */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Titel" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <Field label="Författare / källa" value={form.author} onChange={v => setForm(f => ({ ...f, author: v }))} />
      </div>

      {/* Rad 2: Typ, Svårighetsgrad, Utgåva/Handskrift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select label="Typ" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={TEXT_TYPES} />
        <Select label="Svårighetsgrad" value={form.difficulty} onChange={v => setForm(f => ({ ...f, difficulty: v }))} options={DIFFICULTIES} />
        <Field label="Utgåva / handskrift" value={form.edition} onChange={v => setForm(f => ({ ...f, edition: v }))} placeholder="t.ex. AM 132 fol." />
      </div>

      {/* Rad 3: Sidor, Startdatum, Digital länk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Antal sidor / avsnitt" value={form.totalPages} onChange={v => setForm(f => ({ ...f, totalPages: v }))} placeholder="0" />
        <Field label="Startdatum" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="date" />
        <Field label="Digital länk" value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} placeholder="https://…" />
      </div>

      {/* Förvärvad-toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, acquired: !f.acquired }))}
          className={[
            'flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[12px] transition-all ring-1',
            form.acquired
              ? 'bg-green/10 text-green ring-green/20 hover:bg-green/20'
              : 'bg-surface2 text-muted ring-border hover:text-text',
          ].join(' ')}
        >
          {form.acquired
            ? <><Package size={13} /> Förvärvad</>
            : <><PackageOpen size={13} /> Ej förvärvad</>}
        </button>
        <span className="font-mono text-[10px] text-dim">Klicka för att växla</span>
      </div>

      {/* Anteckningar */}
      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Förhandsnotes</label>
        <textarea
          className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40"
          rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Läsmål, förväntningar…"
        />
      </div>

      {/* Reflektion (alltid i editläge, aldrig vid ny post) */}
      {showReflection && (
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Reflektion</label>
          <textarea
            className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40"
            rows={3} value={form.reflection}
            onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))}
            placeholder="Tankar efter läsning — vad lärde du dig?"
          />
        </div>
      )}

      {/* Betyg (om avklarad) */}
      {showRating && (
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted">Betyg</label>
          <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">{showReflection ? 'Spara' : 'Lägg till'}</button>
        <button type="button" onClick={onCancel} className="btn-ghost">Avbryt</button>
      </div>
    </form>
  )
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'transition-transform hover:scale-110'}
        >
          <Star
            size={16}
            fill={(hovered || value) >= n ? '#fbbf24' : 'none'}
            stroke={(hovered || value) >= n ? '#fbbf24' : 'rgb(var(--color-border2))'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Hjälpkomponenter ─────────────────────────────────────────────────────────

function StatCell({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: color + '15' }}>
        <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="font-mono text-[11px] text-muted">{label}</p>
    </div>
  )
}

function Field({ label, value, onChange, required, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <select
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
        value={value} onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
