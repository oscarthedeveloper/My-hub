import { useState, useMemo } from 'react'
import { Plus, Calendar, Trash2, Pencil, X, Check, ChevronDown } from 'lucide-react'
import { useHPStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// ─── Sektionskonfiguration ────────────────────────────────────────────────────

const VERBAL = [
  { id: 'ORD', label: 'Ordförståelse',            color: '#7c72f5', max: 20 },
  { id: 'LÄS', label: 'Läsförståelse',            color: '#22d3ee', max: 20 },
  { id: 'MEK', label: 'Meningskomplettering',      color: '#fb923c', max: 20 },
  { id: 'ELF', label: 'Engelsk läsförståelse',     color: '#34d399', max: 20 },
]

const KVANTITATIVT = [
  { id: 'XYZ', label: 'Matematisk problemlösning', color: '#fbbf24', max: 20 },
  { id: 'KVA', label: 'Kvantitativa jämförelser',  color: '#e11d48', max: 20 },
  { id: 'NOG', label: 'Datatolkning',               color: '#a78bfa', max: 12 },
  { id: 'DTK', label: 'Diagram, tabeller & kartor', color: '#38bdf8', max: 20 },
]

const ALL_SECTIONS = [...VERBAL, ...KVANTITATIVT]

function sectionById(id) {
  return ALL_SECTIONS.find(s => s.id === id) ?? { id, label: id, color: '#8080a0', max: 20 }
}

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

function pct(score, max) {
  if (!score || !max) return null
  return Math.round((Number(score) / Number(max)) * 100)
}

function avgPct(sessions) {
  const valid = sessions.filter(s => s.score && s.maxScore)
  if (!valid.length) return null
  return Math.round(valid.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0) / valid.length)
}

function bestPct(sessions) {
  const valid = sessions.filter(s => s.score && s.maxScore)
  if (!valid.length) return null
  return Math.round(Math.max(...valid.map(s => (s.score / s.maxScore) * 100)))
}

// ─── Huvud-vy ─────────────────────────────────────────────────────────────────

export default function HPView() {
  const ref = useFadeIn()
  const { examDate, sessions, hpExams, setExamDate, addSession, updateSession, removeSession, daysUntilExam, addHpExam, toggleHpExamSection, removeHpExam } = useHPStore()

  const [tab,        setTab]         = useState('logg')  // 'logg' | 'prov'
  const [showForm,    setShowForm]    = useState(false)
  const [filterSec,  setFilterSec]   = useState('all')
  const [confirmDel, setConfirmDel]  = useState(null)
  const [editId,     setEditId]      = useState(null)

  const BLANK_FORM = {
    section: 'ORD',
    year:    new Date().getFullYear(),
    season:  'Höst',
    part:    1,
    date:    new Date().toISOString().slice(0, 10),
    score:   '',
    maxScore: '',
    notes:   '',
  }

  const [form, setForm] = useState(BLANK_FORM)
  const [editForm, setEditForm] = useState(null)

  const days = daysUntilExam()

  const filtered = useMemo(() => {
    const base = [...sessions].sort((a, b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt))
    return filterSec === 'all' ? base : base.filter(s => s.section === filterSec)
  }, [sessions, filterSec])

  function handleAdd(e) {
    e.preventDefault()
    addSession({
      ...form,
      score:    form.score    ? Number(form.score)    : null,
      maxScore: form.maxScore ? Number(form.maxScore) : null,
      part:     Number(form.part),
    })
    // Auto-skapa provtillfälle i översikten om det inte finns
    addHpExam(Number(form.year), form.season)
    setForm(BLANK_FORM)
    setShowForm(false)
  }

  function startEdit(s) {
    setEditId(s.id)
    setEditForm({
      section:  s.section,
      year:     s.year  ?? new Date().getFullYear(),
      season:   s.season ?? 'Höst',
      part:     s.part  ?? 1,
      date:     s.date ?? s.createdAt?.slice(0, 10) ?? '',
      score:    s.score    != null ? String(s.score)    : '',
      maxScore: s.maxScore != null ? String(s.maxScore) : '',
      notes:    s.notes   ?? '',
    })
  }

  function handleUpdate(e) {
    e.preventDefault()
    updateSession(editId, {
      ...editForm,
      score:    editForm.score    ? Number(editForm.score)    : null,
      maxScore: editForm.maxScore ? Number(editForm.maxScore) : null,
      part:     Number(editForm.part),
    })
    // Auto-skapa om år/termin ändrades
    addHpExam(Number(editForm.year), editForm.season)
    setEditId(null)
    setEditForm(null)
  }

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-2">
        <h1 className="font-display text-3xl text-text">Högskoleprov</h1>
        <p className="mt-1 font-mono text-xs text-muted">
          {sessions.length} sessioner loggade · {ALL_SECTIONS.length} delprov
        </p>
      </div>

      {/* ── Countdown + datumväljare ── */}
      <div className="mb-7 mt-5 rounded-xl border border-border bg-surface px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-baseline gap-3">
            {days !== null ? (
              <>
                <span className="font-display text-5xl font-bold text-text tabular-nums">{days}</span>
                <span className="font-mono text-sm text-muted">dagar till provdag</span>
              </>
            ) : (
              <span className="font-mono text-sm text-muted">// Ange provdatum →</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Calendar size={14} className="text-muted" />
            <input
              type="date"
              className="rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
              value={examDate ?? ''}
              onChange={e => setExamDate(e.target.value)}
            />
          </div>
        </div>

        {days !== null && (
          <div className="mt-4">
            <div className="h-px w-full bg-border">
              <div
                className="h-px bg-amber transition-all"
                style={{ width: `${Math.max(2, 100 - (days / 365) * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span className="font-mono text-[10px] text-dim">idag</span>
              <span className="font-mono text-[10px] text-dim">
                {examDate ? new Date(examDate).toLocaleDateString('sv-SE') : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Flikar ── */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {[['logg', 'Sessionslogg'], ['prov', 'Provöversikt']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'px-4 py-2.5 font-mono text-[12px] transition-colors border-b-2 -mb-px',
              tab === id
                ? 'border-amber text-text'
                : 'border-transparent text-muted hover:text-text',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Provöversikt ── */}
      {tab === 'prov' && (
        <ExamGrid hpExams={hpExams} sessions={sessions} onAdd={addHpExam} onToggle={toggleHpExamSection} onRemove={removeHpExam} />
      )}

      {tab === 'logg' && <>
      {/* ── Sektionsöversikt ── */}
      <div className="mb-7 space-y-4">
        {/* Verbalt */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dim">// verbalt</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VERBAL.map(sec => <SectionCard key={sec.id} sec={sec} sessions={sessions.filter(s => s.section === sec.id)} onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)} active={filterSec === sec.id} />)}
          </div>
        </div>

        {/* Kvantitativt */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dim">// kvantitativt</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KVANTITATIVT.map(sec => <SectionCard key={sec.id} sec={sec} sessions={sessions.filter(s => s.section === sec.id)} onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)} active={filterSec === sec.id} />)}
          </div>
        </div>
      </div>

      {/* ── Sessionslogg ── */}
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono text-[10px] uppercase tracking-widest text-dim mr-1">// log</p>
            {/* Filter chips */}
            <button
              onClick={() => setFilterSec('all')}
              className={['rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all',
                filterSec === 'all' ? 'bg-surface2 text-text ring-1 ring-border' : 'text-muted hover:text-text'].join(' ')}
            >
              alla
            </button>
            {ALL_SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)}
                className={['rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all',
                  filterSec === sec.id ? 'ring-1' : 'text-muted hover:text-text'].join(' ')}
                style={filterSec === sec.id
                  ? { backgroundColor: sec.color + '18', color: sec.color, ringColor: sec.color + '40' }
                  : {}}
              >
                {sec.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted">{filtered.length} sessioner</span>
            <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
              <Plus size={13} /> Ny session
            </button>
          </div>
        </div>

        {/* ── Lägg till-formulär ── */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-5 rounded-xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-text">Ny session</p>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
            </div>
            <SessionFormFields form={form} setForm={setForm} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Logga</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
            </div>
          </form>
        )}

        {/* ── Sessionslista ── */}
        <div className="space-y-2">
          {filtered.map(s => {
            const sec = sectionById(s.section)
            const p   = pct(s.score, s.maxScore)

            if (editId === s.id) {
              return (
                <form key={s.id} onSubmit={handleUpdate} className="rounded-xl border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold" style={{ color: sec.color }}>{sec.id}</span>
                    <button type="button" onClick={() => setEditId(null)} className="text-muted hover:text-text"><X size={14} /></button>
                  </div>
                  <SessionFormFields form={editForm} setForm={setEditForm} hpExams={hpExams} />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary flex items-center gap-1.5"><Check size={13} /> Spara</button>
                    <button type="button" onClick={() => setEditId(null)} className="btn-ghost">Avbryt</button>
                  </div>
                </form>
              )
            }

            return (
              <SessionRow
                key={s.id}
                session={s}
                sec={sec}
                pct={p}
                onEdit={() => startEdit(s)}
                onDelete={() => setConfirmDel(s.id)}
              />
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-14 text-center">
              <p className="font-mono text-xs text-muted">
                {sessions.length === 0 ? '// Inga sessioner ännu — logga din första' : '// Inga sessioner för detta delprov'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Radera-bekräftelse ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-4">Ta bort sessionen?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { removeSession(confirmDel); setConfirmDel(null) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(null)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({ sec, sessions, onClick, active }) {
  const avg  = avgPct(sessions)
  const best = bestPct(sessions)
  const last = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const lastPct = last ? pct(last.score, last.maxScore) : null

  // Mini sparkline — sista 5 sessions
  const spark = sessions.slice(-5).map(s => pct(s.score, s.maxScore)).filter(v => v !== null)

  return (
    <button
      onClick={onClick}
      className={[
        'group relative overflow-hidden rounded-xl border bg-surface p-4 text-left transition-all duration-150',
        active ? 'border-[color:var(--sec-color)] shadow-sm' : 'border-border hover:border-border2',
      ].join(' ')}
      style={{ '--sec-color': sec.color + '70' }}
    >
      {/* Top accent bar */}
      <div className="absolute left-0 top-0 h-0.5 w-full rounded-t-xl" style={{ backgroundColor: sec.color }} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-mono text-sm font-bold leading-none" style={{ color: sec.color }}>{sec.id}</p>
          <p className="mt-1 font-mono text-[10px] text-muted leading-snug">{sec.label}</p>
        </div>
        <span className="font-mono text-[10px] text-dim">{sessions.length}×</span>
      </div>

      {avg !== null ? (
        <>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="font-display text-2xl font-bold text-text">{avg}</span>
            <span className="font-mono text-[11px] text-muted">% snitt</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-3">
            <span>bäst <span style={{ color: sec.color }}>{best}%</span></span>
            {lastPct !== null && <span>senast <span className="text-text">{lastPct}%</span></span>}
          </div>
          {/* Sparkline */}
          {spark.length > 1 && (
            <div className="flex items-end gap-0.5 h-6">
              {spark.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{ height: `${v}%`, backgroundColor: sec.color + (i === spark.length - 1 ? 'dd' : '55') }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="font-mono text-[11px] text-dim">// ingen data</p>
      )}
    </button>
  )
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

function SessionRow({ session, sec, pct: p, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const dateStr = session.date
    ? new Date(session.date).toLocaleDateString('sv-SE')
    : session.createdAt
      ? new Date(session.createdAt).toLocaleDateString('sv-SE')
      : '—'

  return (
    <div className="rounded-xl border border-border bg-surface transition-colors hover:border-border2">
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center gap-4 px-4 py-3"
        onClick={() => setExpanded(s => !s)}
      >
        {/* Badge */}
        <span
          className="shrink-0 rounded-lg px-2 py-1 font-mono text-xs font-bold tabular-nums"
          style={{ backgroundColor: sec.color + '18', color: sec.color }}
        >
          {session.section}
        </span>

        {/* Score */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-mono text-sm font-medium text-text">
            {session.score ?? '—'}/{session.maxScore ?? '—'}
          </span>
          {p !== null && (
            <span className="font-mono text-xs" style={{ color: p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#e11d48' }}>
              {p}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {p !== null && (
          <div className="flex-1 h-px bg-border">
            <div
              className="h-px transition-all"
              style={{ width: `${p}%`, backgroundColor: sec.color }}
            />
          </div>
        )}

        {/* Provinfo + datum */}
        <div className="ml-auto flex items-center gap-3 shrink-0 text-right">
          {session.year && (
            <span className="font-mono text-[11px] text-muted">
              {session.year} {session.season}
              {session.part ? ` · Delprov ${session.part}` : ''}
            </span>
          )}
          <span className="font-mono text-[11px] text-dim">{dateStr}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="rounded p-1 text-muted hover:text-text transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-muted hover:text-rose transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: notes */}
      {expanded && session.notes && (
        <div className="border-t border-border px-4 py-3">
          <p className="font-sans text-xs italic text-muted">{session.notes}</p>
        </div>
      )}
    </div>
  )
}

// ─── SessionFormFields ────────────────────────────────────────────────────────

const FORM_YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i)

function SessionFormFields({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

      {/* Rad 1: Delprov, År, Termin */}
      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Delprov</label>
        <select
          className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
          value={form.section}
          onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
        >
          <optgroup label="Verbalt">
            {VERBAL.map(s => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
          </optgroup>
          <optgroup label="Kvantitativt">
            {KVANTITATIVT.map(s => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
          </optgroup>
        </select>
      </div>

      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">År</label>
        <select
          className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
          value={form.year}
          onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
        >
          {FORM_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Termin</label>
        <select
          className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
          value={form.season}
          onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
        >
          <option value="Vår">Vår</option>
          <option value="Höst">Höst</option>
        </select>
      </div>

      {/* Rad 2: Delprovsnummer, Poäng, Max poäng */}
      <div>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Delprovsnummer</label>
        <select
          className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
          value={form.part}
          onChange={e => setForm(f => ({ ...f, part: Number(e.target.value) }))}
        >
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Delprov {n}</option>)}
        </select>
      </div>

      <Field label="Poäng" value={form.score} onChange={v => setForm(f => ({ ...f, score: v }))} type="number" placeholder="0" />
      <Field label="Max poäng" value={form.maxScore} onChange={v => setForm(f => ({ ...f, maxScore: v }))} type="number" placeholder="20" />

      {/* Rad 3: Anteckningar (full bredd) */}
      <div className="col-span-3">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Anteckningar</label>
        <input
          className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Vad gick bra / mindre bra?"
        />
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ─── ExamGrid ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)
const SEASONS = ['Vår', 'Höst']

function ExamGrid({ hpExams, sessions, onAdd, onToggle, onRemove }) {
  const [year,   setYear]   = useState(CURRENT_YEAR)
  const [season, setSeason] = useState('Höst')
  const [confirmDel, setConfirmDel] = useState(null)

  const sorted = [...hpExams].sort((a, b) =>
    b.year !== a.year ? b.year - a.year : (a.season === 'Höst' ? -1 : 1)
  )

  const totalSections = ALL_SECTIONS.length

  function handleAdd() {
    const result = onAdd(Number(year), season)
    if (!result) return // duplicate
  }

  return (
    <div>
      {/* ── Lägg till prov ── */}
      <div className="mb-5 flex items-end gap-3">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">År</label>
          <select
            className="rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Termin</label>
          <select
            className="rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
            value={season}
            onChange={e => setSeason(e.target.value)}
          >
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5 mb-0.5">
          <Plus size={13} /> Lägg till prov
        </button>
      </div>

      {/* ── Matris ── */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="font-mono text-xs text-muted">// Lägg till ett HP-tillfälle ovan</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-x-auto">
          <div className="min-w-[640px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="w-28 px-4 py-3 text-left">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Tillfälle</span>
                </th>
                {/* Verbalt */}
                {VERBAL.map(sec => (
                  <th key={sec.id} className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-[11px] font-bold" style={{ color: sec.color }}>{sec.id}</span>
                      <span className="font-mono text-[8px] text-dim leading-tight max-w-[48px] text-center">{sec.label.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
                {/* Separator */}
                <th className="w-px bg-border px-0" />
                {/* Kvantitativt */}
                {KVANTITATIVT.map(sec => (
                  <th key={sec.id} className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-[11px] font-bold" style={{ color: sec.color }}>{sec.id}</span>
                      <span className="font-mono text-[8px] text-dim leading-tight max-w-[48px] text-center">{sec.label.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
                <th className="w-16 px-3 py-3 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-dim">%</span>
                </th>
                <th className="w-8 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((exam, i) => {
                // En sektion är gjord om det finns en session med matchande år+termin+sektion,
                // ELLER om den är manuellt markerad i completed-listan
                function sectionStatus(secId) {
                  const fromSession = sessions.some(
                    s => Number(s.year) === Number(exam.year) && s.season === exam.season && s.section === secId
                  )
                  const manual = exam.completed?.includes(secId) ?? false
                  return { done: fromSession || manual, fromSession, manual }
                }
                const doneCount = ALL_SECTIONS.filter(s => sectionStatus(s.id).done).length
                const pct       = Math.round((doneCount / totalSections) * 100)

                return (
                  <tr key={exam.id} className={i < sorted.length - 1 ? 'border-b border-border' : ''}>
                    {/* Tillfälle */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono text-[12px] font-medium text-text">{exam.year}</p>
                        <p className="font-mono text-[10px] text-muted">{exam.season}</p>
                      </div>
                    </td>
                    {/* Verbala celler */}
                    {VERBAL.map(sec => {
                      const { done, fromSession } = sectionStatus(sec.id)
                      return (
                        <ExamCell
                          key={sec.id}
                          done={done}
                          fromSession={fromSession}
                          color={sec.color}
                          onClick={() => onToggle(exam.id, sec.id)}
                        />
                      )
                    })}
                    {/* Separator */}
                    <td className="w-px bg-border p-0" />
                    {/* Kvantitativa celler */}
                    {KVANTITATIVT.map(sec => {
                      const { done, fromSession } = sectionStatus(sec.id)
                      return (
                        <ExamCell
                          key={sec.id}
                          done={done}
                          fromSession={fromSession}
                          color={sec.color}
                          onClick={() => onToggle(exam.id, sec.id)}
                        />
                      )
                    })}
                    {/* Procent */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[11px] tabular-nums" style={{ color: pct === 100 ? '#059669' : pct >= 50 ? '#d97706' : 'rgb(var(--color-muted))' }}>
                          {doneCount}/{totalSections}
                        </span>
                        <div className="h-0.5 w-8 rounded-full bg-surface2">
                          <div
                            className="h-0.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#fbbf24' }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Ta bort */}
                    <td className="px-2 py-3">
                      <button
                        onClick={() => setConfirmDel(exam.id)}
                        className="rounded p-1 text-muted hover:text-rose transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Teckenförklaring */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-dim">Förklaring:</span>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded border-2 border-dashed border-border2 bg-surface2" />
              <span className="font-mono text-[10px] text-muted">Ej gjort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-green/20">
                <Check size={9} strokeWidth={3} className="text-green" />
              </div>
              <span className="font-mono text-[10px] text-muted">Gjort via session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-green/20">
                <Check size={9} strokeWidth={1.5} className="text-green" />
              </div>
              <span className="font-mono text-[10px] text-muted">Manuellt markerat</span>
            </div>
            <span className="ml-auto font-mono text-[9px] text-dim">V = Verbalt · K = Kvantitativt</span>
          </div>
        </div>
        </div>
      )}

      {/* Radera-bekräftelse */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-4">Ta bort detta provtillfälle?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { onRemove(confirmDel); setConfirmDel(null) }}
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

function ExamCell({ done, fromSession, color, onClick }) {
  return (
    <td className="px-2 py-3 text-center">
      <button
        title={fromSession ? 'Gjort via sessionslogg' : done ? 'Manuellt markerat' : 'Klicka för att markera'}
        onClick={onClick}
        className={[
          'mx-auto flex h-7 w-7 items-center justify-center rounded transition-all duration-150',
          done
            ? 'ring-1'
            : 'border-2 border-dashed border-border2 bg-surface2 hover:border-border2 hover:bg-surface',
        ].join(' ')}
        style={done ? { backgroundColor: color + '20', color, ringColor: color + '50' } : {}}
      >
        {done && (
          fromSession
            ? <Check size={12} strokeWidth={3} />          /* Djärv = från session */
            : <Check size={12} strokeWidth={1.5} />        /* Tunn = manuell */
        )}
      </button>
    </td>
  )
}
