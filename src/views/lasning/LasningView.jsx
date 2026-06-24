import { useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useLasningStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#7c72f5', '#22d3ee', '#34d399', '#fbbf24',
  '#f97316', '#e11d48', '#a78bfa', '#94a3b8',
]

const WORK_TYPES = ['Bok', 'E-bok', 'Examensarbete', 'Uppsats', 'Artikel', 'Tidskrift', 'Podcast', 'Annat']

const STATUSES = [
  { id: 'vill läsa', label: 'Vill läsa', color: 'rgb(var(--color-muted))',  bg: 'rgb(var(--color-surface2))' },
  { id: 'läser',     label: 'Läser',     color: '#f97316',                  bg: '#f9731610' },
  { id: 'läst',      label: 'Läst',      color: '#34d399',                  bg: '#34d39910' },
]

function statusStyle(statusId) {
  return STATUSES.find(s => s.id === statusId) ?? STATUSES[0]
}

// ─── Hjälpkomponenter ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, required, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <select
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.id ?? o} value={o.id ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Färg</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="h-6 w-6 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              outline: value === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Verksformulär ────────────────────────────────────────────────────────────

const emptyWork = {
  title: '', author: '', subject: '', type: 'Bok', cost: '', buyUrl: '',
  status: 'vill läsa', startedAt: '', finishedAt: '', notes: '',
}

function WorkForm({ initial = emptyWork, onSave, onCancel, color }) {
  const [form, setForm] = useState({ ...emptyWork, ...initial })
  const f = (key) => (v) => setForm(s => ({ ...s, [key]: v }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave(form) }}
      className="rounded-xl border border-border bg-surface2 p-4 space-y-3"
    >
      <p className="font-mono text-[11px] text-muted">// {initial.id ? 'Redigera verk' : 'Nytt verk'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Titel" value={form.title} onChange={f('title')} required placeholder="t.ex. Sapiens" />
        <Field label="Författare" value={form.author} onChange={f('author')} placeholder="t.ex. Yuval Noah Harari" />
        <Field label="Ämne" value={form.subject} onChange={f('subject')} placeholder="t.ex. Historia" />
        <SelectField label="Typ" value={form.type} onChange={f('type')} options={WORK_TYPES} />
        <SelectField label="Status" value={form.status} onChange={f('status')} options={STATUSES} />
        <Field label="Ungefärlig kostnad (kr)" value={form.cost} onChange={f('cost')} placeholder="t.ex. 250" />
        <Field label="Köplänk" value={form.buyUrl} onChange={f('buyUrl')} placeholder="https://…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Datum påbörjat" value={form.startedAt} onChange={f('startedAt')} type="date" />
        <Field label="Datum avslutat" value={form.finishedAt} onChange={f('finishedAt')} type="date" />
      </div>

      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Anteckning</label>
        <textarea
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
          rows={2}
          value={form.notes}
          onChange={e => setForm(s => ({ ...s, notes: e.target.value }))}
          placeholder="Egna tankar…"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex items-center gap-1.5">
          <Check size={12} /> Spara
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">Avbryt</button>
      </div>
    </form>
  )
}

// ─── Verkskort ────────────────────────────────────────────────────────────────

function WorkCard({ work, color, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const st = statusStyle(work.status)

  if (editing) {
    return (
      <WorkForm
        initial={work}
        color={color}
        onSave={patch => { onUpdate(patch); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="group relative rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-border2">
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
      <div className="p-4 space-y-2">

        {/* Rubrikrad */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-medium text-text leading-snug">{work.title}</p>
            {work.author && (
              <p className="font-mono text-[11px] text-dim mt-0.5">{work.author}</p>
            )}
            {work.subject && (
              <p className="font-mono text-[11px] text-muted mt-0.5">{work.subject}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {work.buyUrl && (
              <a
                href={work.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-1 text-dim hover:text-accent transition-colors"
                title="Öppna köpsida"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={11} />
              </a>
            )}
            <button
              onClick={() => setEditing(true)}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-md p-1 text-dim hover:text-muted transition-all"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={onDelete}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-md p-1 text-dim hover:text-rose transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px]"
            style={{ backgroundColor: st.bg, color: st.color }}
          >
            {st.label}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
            {work.type}
          </span>
          {work.cost && (
            <span className="font-mono text-[10px] text-muted">ca {work.cost} kr</span>
          )}
        </div>

        {/* Datum */}
        {(work.startedAt || work.finishedAt) && (
          <p className="font-mono text-[10px] text-dim">
            {work.startedAt && `Startad ${new Date(work.startedAt).toLocaleDateString('sv-SE')}`}
            {work.startedAt && work.finishedAt && ' · '}
            {work.finishedAt && `Avslutad ${new Date(work.finishedAt).toLocaleDateString('sv-SE')}`}
          </p>
        )}

        {/* Anteckning */}
        {work.notes && (
          <p className="font-mono text-[11px] text-muted italic line-clamp-2">"{work.notes}"</p>
        )}
      </div>
    </div>
  )
}

// ─── Kategori-sektion ─────────────────────────────────────────────────────────

function CategorySection({ cat, filterStatus, onDeleteCat, onUpdateCat, onAddWork, onUpdateWork, onDeleteWork }) {
  const [open, setOpen]         = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat]   = useState(false)
  const [catDraft, setCatDraft] = useState({ name: cat.name, color: cat.color })
  const [confirmDel, setConfirmDel] = useState(false)

  const color = cat.color ?? '#7c72f5'
  const works = (cat.works ?? []).filter(w =>
    filterStatus === 'alla' || w.status === filterStatus
  )
  const totalWorks = (cat.works ?? []).length

  function handleSaveCat(e) {
    e.preventDefault()
    onUpdateCat(catDraft)
    setEditCat(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">

      {/* Kategori-rubrik */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        {editCat ? (
          <form onSubmit={handleSaveCat} className="flex flex-1 items-center gap-3 flex-wrap">
            <input
              className="flex-1 min-w-0 rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-sm text-text outline-none focus:border-accent/40"
              value={catDraft.name}
              onChange={e => setCatDraft(d => ({ ...d, name: e.target.value }))}
              required
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatDraft(d => ({ ...d, color: c }))}
                  className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: catDraft.color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button type="submit" className="rounded-lg p-1.5 text-accent hover:bg-accent/10">
                <Check size={14} />
              </button>
              <button type="button" onClick={() => setEditCat(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface2">
                <X size={14} />
              </button>
            </div>
          </form>
        ) : (
          <>
            <button onClick={() => setOpen(o => !o)} className="flex flex-1 items-center gap-3 text-left">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="font-display text-base text-text">{cat.name}</h3>
              <span className="font-mono text-[11px] text-muted">{totalWorks} verk</span>
              {open ? <ChevronUp size={14} className="ml-auto text-muted" /> : <ChevronDown size={14} className="ml-auto text-muted" />}
            </button>
            <button
              onClick={() => { setCatDraft({ name: cat.name, color: cat.color }); setEditCat(true) }}
              className="rounded-lg p-1.5 text-dim hover:text-muted hover:bg-surface2 transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="rounded-lg p-1.5 text-dim hover:text-rose hover:bg-rose/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      {/* Innehåll */}
      {open && (
        <div className="p-5">
          {works.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {works.map(w => (
                <WorkCard
                  key={w.id}
                  work={w}
                  color={color}
                  onDelete={() => onDeleteWork(w.id)}
                  onUpdate={patch => onUpdateWork(w.id, patch)}
                />
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="mb-4 rounded-xl border border-dashed border-border py-8 text-center">
                <p className="font-mono text-xs text-muted">
                  {filterStatus !== 'alla' ? `// Inga verk med status "${filterStatus}"` : '// Inga verk ännu'}
                </p>
              </div>
            )
          )}

          {showForm ? (
            <WorkForm
              color={color}
              onSave={work => { onAddWork(work); setShowForm(false) }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
            >
              <Plus size={13} style={{ color }} /> Lägg till verk
            </button>
          )}
        </div>
      )}

      {/* Bekräfta radering */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-1">Ta bort kategorin "{cat.name}"?</p>
            <p className="font-mono text-[11px] text-muted mb-5">
              Alla {totalWorks} verk i kategorin raderas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onDeleteCat(); setConfirmDel(false) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 font-mono text-sm text-rose ring-1 ring-rose/20 hover:bg-rose/20 transition-all"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(false)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Huvudvy ─────────────────────────────────────────────────────────────────

export default function LasningView() {
  const ref = useFadeIn()
  const { categories, addCategory, updateCategory, removeCategory, addWork, updateWork, removeWork } = useLasningStore()

  const [showCatForm, setShowCatForm]   = useState(false)
  const [catForm, setCatForm]           = useState({ name: '', color: PRESET_COLORS[0] })
  const [filterStatus, setFilterStatus] = useState('alla')

  // Globala stats
  const allWorks   = categories.flatMap(c => c.works ?? [])
  const totalWorks = allWorks.length
  const reading    = allWorks.filter(w => w.status === 'läser').length
  const finished   = allWorks.filter(w => w.status === 'läst').length
  const wantTo     = allWorks.filter(w => w.status === 'vill läsa').length

  function handleCreateCat(e) {
    e.preventDefault()
    if (!catForm.name.trim()) return
    addCategory({ name: catForm.name.trim(), color: catForm.color })
    setCatForm({ name: '', color: PRESET_COLORS[0] })
    setShowCatForm(false)
  }

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-text">Läsning</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {totalWorks} verk · {reading} pågående · {finished} avslutade
          </p>
        </div>
        <button
          onClick={() => setShowCatForm(s => !s)}
          className="btn-primary flex items-center gap-1.5 self-start"
        >
          <Plus size={13} /> Ny kategori
        </button>
      </div>

      {/* ── Statistikrad ── */}
      {totalWorks > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Vill läsa', value: wantTo,   color: 'rgb(var(--color-muted))' },
            { label: 'Läser',     value: reading,  color: '#f97316' },
            { label: 'Läst',      value: finished, color: '#34d399' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface px-4 py-3 text-center">
              <p className="font-mono text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Statusfilter ── */}
      {totalWorks > 0 && (
        <div className="mb-6 flex gap-1.5 flex-wrap">
          {['alla', 'vill läsa', 'läser', 'läst'].map(s => {
            const st = STATUSES.find(x => x.id === s)
            const isActive = filterStatus === s
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all"
                style={isActive
                  ? { backgroundColor: st ? st.bg : 'rgb(var(--color-surface2))', color: st ? st.color : 'rgb(var(--color-text))', outline: '1px solid', outlineColor: st ? st.color + '40' : 'rgb(var(--color-border))' }
                  : { color: 'rgb(var(--color-muted))' }
                }
              >
                {s === 'alla' ? 'Alla' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Ny kategori-formulär ── */}
      {showCatForm && (
        <form onSubmit={handleCreateCat} className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Skapa kategori</p>
            <button type="button" onClick={() => setShowCatForm(false)} className="text-muted hover:text-text">
              <X size={15} />
            </button>
          </div>
          <Field
            label="Namn"
            value={catForm.name}
            onChange={v => setCatForm(f => ({ ...f, name: v }))}
            required
            placeholder="t.ex. Fakta, Skönlitteratur, Engelska…"
          />
          <ColorPicker value={catForm.color} onChange={v => setCatForm(f => ({ ...f, color: v }))} />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">Skapa</button>
            <button type="button" onClick={() => setShowCatForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      {/* ── Kategori-lista ── */}
      {categories.length === 0 && !showCatForm ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mb-3 flex justify-center text-muted">
            <BookOpen size={28} strokeWidth={1.2} />
          </div>
          <p className="font-mono text-sm text-muted">// Inga kategorier ännu</p>
          <p className="mt-1 font-mono text-[11px] text-dim">
            Skapa t.ex. "Fakta", "Skönlitteratur" eller "Engelska"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              filterStatus={filterStatus}
              onDeleteCat={() => removeCategory(cat.id)}
              onUpdateCat={patch => updateCategory(cat.id, patch)}
              onAddWork={work => addWork(cat.id, work)}
              onUpdateWork={(wId, patch) => updateWork(cat.id, wId, patch)}
              onDeleteWork={wId => removeWork(cat.id, wId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
