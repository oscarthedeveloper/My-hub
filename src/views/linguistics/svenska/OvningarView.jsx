import { useState, useMemo } from 'react'
import { Plus, Target, TrendingUp, X } from 'lucide-react'
import { useHPStore } from '@/store'
import LinkedDocsSection from '@/components/LinkedDocsSection'

const SECTIONS = ['ORD', 'LÄS', 'DTK', 'XYZ', 'MEK']
const SECTION_COLORS = {
  ORD: '#7c72f5',
  LÄS: '#22d3ee',
  DTK: '#34d399',
  XYZ: '#fbbf24',
  MEK: '#e11d48',
}

export default function OvningarView() {
  const { sessions, addSession } = useHPStore()

  const [showForm, setShowForm] = useState(false)
  const [filterSection, setFilterSection] = useState('all')
  const [form, setForm] = useState({
    section: 'ORD', date: new Date().toISOString().slice(0, 10),
    score: '', maxScore: '', notes: '', source: '',
  })

  const filtered = useMemo(() => {
    const base = sessions.filter(s => SECTIONS.includes(s.section))
    return filterSection === 'all' ? base : base.filter(s => s.section === filterSection)
  }, [sessions, filterSection])

  // Per-section stats
  const sectionStats = useMemo(() => {
    return Object.fromEntries(SECTIONS.map(sec => {
      const secSessions = sessions.filter(s => s.section === sec)
      const scores = secSessions.filter(s => s.score && s.maxScore).map(s => (s.score / s.maxScore) * 100)
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
      const best = scores.length ? Math.round(Math.max(...scores)) : null
      return [sec, { count: secSessions.length, avg, best }]
    }))
  }, [sessions])

  function handleAdd(e) {
    e.preventDefault()
    addSession({
      ...form,
      score: form.score ? parseInt(form.score) : null,
      maxScore: form.maxScore ? parseInt(form.maxScore) : null,
    })
    setForm({ section: 'ORD', date: new Date().toISOString().slice(0, 10), score: '', maxScore: '', notes: '', source: '' })
    setShowForm(false)
  }

  return (
    <div>
      {/* ── Bifogade dokument ── */}
      <div className="mb-5">
        <LinkedDocsSection language="svenska" view="ovningar" />
      </div>

      {/* ── Section stats grid ── */}
      <div className="mb-6 grid grid-cols-3 md:grid-cols-5 gap-2">
        {SECTIONS.map(sec => {
          const s = sectionStats[sec]
          const color = SECTION_COLORS[sec]
          return (
            <div key={sec} className="rounded-xl border border-border bg-surface p-3 text-center">
              <div className="mb-2 font-mono text-xs font-bold" style={{ color }}>{sec}</div>
              <div className="font-mono text-lg font-medium text-text">{s.avg !== null ? `${s.avg}%` : '—'}</div>
              <div className="font-mono text-[10px] text-muted">snitt</div>
              {s.best !== null && (
                <div className="mt-1 font-mono text-[10px]" style={{ color }}>bäst {s.best}%</div>
              )}
              <div className="mt-1 font-mono text-[10px] text-dim">{s.count} pass</div>
            </div>
          )
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          <button onClick={() => setFilterSection('all')}
            className={['rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all',
              filterSection === 'all' ? 'bg-surface2 text-text ring-1 ring-border' : 'text-muted hover:text-text'].join(' ')}>
            alla
          </button>
          {SECTIONS.map(sec => (
            <button key={sec} onClick={() => setFilterSection(sec)}
              className={['rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all',
                filterSection === sec ? 'bg-surface2 text-text ring-1 ring-border' : 'text-muted hover:text-text'].join(' ')}>
              {sec}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted ml-auto">{filtered.length} pass</span>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Nytt pass
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Nytt övningspass</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Sektion</label>
              <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40"
                value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
                {SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Datum" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
            <Field label="Källa / provnr" value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} placeholder="HP 2023 H, delp. 1…" />
            <Field label="Poäng" value={form.score} onChange={v => setForm(f => ({ ...f, score: v }))} placeholder="t.ex. 18" />
            <Field label="Max poäng" value={form.maxScore} onChange={v => setForm(f => ({ ...f, maxScore: v }))} placeholder="t.ex. 22" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Anteckningar</label>
            <textarea className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40"
              rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Vad gick bra? Vad behöver förbättras?" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      {/* ── Session log ── */}
      <div className="space-y-2">
        {[...filtered].reverse().map(session => {
          const color = SECTION_COLORS[session.section] ?? '#8080a0'
          const pct = session.score && session.maxScore
            ? Math.round((session.score / session.maxScore) * 100) : null
          return (
            <div key={session.id} className="rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="rounded font-mono text-xs font-bold px-2 py-0.5"
                    style={{ backgroundColor: color + '18', color }}
                  >
                    {session.section}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      {pct !== null ? (
                        <>
                          <span className="font-mono text-sm font-medium text-text">{session.score}/{session.maxScore}</span>
                          <span className="font-mono text-xs" style={{ color }}>{pct}%</span>
                        </>
                      ) : (
                        <span className="font-mono text-sm text-muted">— poäng</span>
                      )}
                    </div>
                    {session.source && (
                      <p className="font-mono text-[11px] text-muted">{session.source}</p>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-dim shrink-0">
                  {session.date ?? new Date(session.createdAt).toLocaleDateString('sv-SE')}
                </span>
              </div>
              {pct !== null && (
                <div className="mt-2 h-px w-full bg-border">
                  <div className="h-px transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              )}
              {session.notes && (
                <p className="mt-2 font-sans text-xs italic text-muted">{session.notes}</p>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="font-mono text-xs text-muted">// Inga övningspass ännu — logga ditt första</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </div>
  )
}
