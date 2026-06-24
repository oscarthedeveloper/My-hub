import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Hash, FileText, BookMarked, RefreshCw, Settings, X, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import { useFadeIn, useStaggerIn } from '@/hooks/useGSAP'
import { pullAllCollections } from '@/lib/sync'
import { PREFIX } from '@/lib/storage'

const PRESET_COLORS = ['#7c72f5','#22d3ee','#34d399','#fbbf24','#f97316','#e11d48','#a78bfa','#ec4899']

// ─── Färgväljare ──────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full transition-all"
          style={{
            backgroundColor: c,
            outline: value === c ? `2px solid ${c}` : '2px solid transparent',
            outlineOffset: '2px',
          }}
        />
      ))}
    </div>
  )
}

// ─── Inline edit-rad ──────────────────────────────────────────────────────────

function EditLangRow({ lang, onDone }) {
  const { updateLanguage } = useLinguisticsStore()
  const [form, setForm] = useState({ label: lang.label, flag: lang.flag, color: lang.color })

  const inputCls = 'rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[12px] text-text outline-none focus:border-accent/50 transition-all'

  function save() {
    if (!form.label.trim() || !form.flag.trim()) return
    updateLanguage(lang.id, { label: form.label.trim(), flag: form.flag.trim(), color: form.color })
    onDone()
  }

  return (
    <div className="flex flex-col gap-2.5 px-3 py-3 rounded-xl border border-border2 bg-surface2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          placeholder="Namn"
          className={inputCls + ' col-span-1'}
        />
        <input
          value={form.flag}
          onChange={e => setForm(f => ({ ...f, flag: e.target.value }))}
          placeholder="Förkortning (t.ex. SV)"
          maxLength={4}
          className={inputCls + ' col-span-1'}
        />
        <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          className="flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent/20 transition-colors"
        >
          <Check size={11} /> Spara
        </button>
        <button
          onClick={onDone}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 font-mono text-[11px] text-muted hover:text-text transition-colors"
        >
          <X size={11} /> Avbryt
        </button>
      </div>
    </div>
  )
}

// ─── Inline ta-bort-rad ───────────────────────────────────────────────────────

function DeleteLangRow({ lang, onDone }) {
  const { removeLanguage } = useLinguisticsStore()
  const [confirm, setConfirm] = useState('')

  const ready = confirm === lang.label

  function handleDelete() {
    if (!ready) return
    removeLanguage(lang.id)
    onDone()
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-3 rounded-xl border border-rose/30 bg-rose/5">
      <p className="font-mono text-[11px] text-muted">
        Skriv <span className="text-text font-medium">"{lang.label}"</span> för att bekräfta borttagning.
        All data för språket tas bort.
      </p>
      <div className="flex gap-2 flex-wrap">
        <input
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder={lang.label}
          className="flex-1 min-w-[140px] rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-rose/40 transition-all"
        />
        <button
          onClick={handleDelete}
          disabled={!ready}
          className="flex items-center gap-1 rounded-lg border border-rose/30 px-2.5 py-1.5 font-mono text-[11px] text-rose hover:bg-rose/10 transition-colors disabled:opacity-30"
        >
          <Trash2 size={11} /> Ta bort
        </button>
        <button
          onClick={onDone}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
        >
          <X size={11} /> Avbryt
        </button>
      </div>
    </div>
  )
}

// ─── Lägg till nytt språk ─────────────────────────────────────────────────────

function AddLanguageForm() {
  const { addLanguage } = useLinguisticsStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', flag: '', color: PRESET_COLORS[0] })

  const inputCls = 'rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all'

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim() || !form.flag.trim()) return
    const result = addLanguage(form)
    if (result) {
      setForm({ label: '', flag: '', color: PRESET_COLORS[0] })
      setOpen(false)
    }
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
    >
      <Plus size={12} /> Lägg till nytt språk
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-mono text-[11px] text-muted">Nytt språk</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          placeholder="Namn (t.ex. Latin)"
          required
          className={inputCls}
        />
        <input
          value={form.flag}
          onChange={e => setForm(f => ({ ...f, flag: e.target.value }))}
          placeholder="Förkortning (t.ex. LA)"
          maxLength={4}
          required
          className={inputCls}
        />
      </div>
      <div>
        <p className="font-mono text-[10px] text-dim mb-1.5">Färg</p>
        <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 font-mono text-[11px] text-accent hover:bg-accent/20 transition-colors"
        >
          <Plus size={11} /> Lägg till
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
        >
          <X size={11} /> Avbryt
        </button>
      </div>
    </form>
  )
}

// ─── Manage panel ─────────────────────────────────────────────────────────────

function ManagePanel({ onClose }) {
  const { languages } = useLinguisticsStore()
  const [editingId, setEditingId]   = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[12px] font-medium text-text flex items-center gap-2">
          <Settings size={12} /> Hantera språk
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
        >
          <X size={11} /> Klar
        </button>
      </div>

      <div className="space-y-2">
        {languages.map(lang => {
          if (editingId === lang.id)
            return <EditLangRow key={lang.id} lang={lang} onDone={() => setEditingId(null)} />
          if (deletingId === lang.id)
            return <DeleteLangRow key={lang.id} lang={lang} onDone={() => setDeletingId(null)} />

          const bg = lang.color + '20'
          return (
            <div key={lang.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded shrink-0"
                style={{ backgroundColor: bg, color: lang.color }}
              >
                {lang.flag}
              </span>
              <span className="font-mono text-[12px] text-text flex-1 truncate">{lang.label}</span>
              <span className="font-mono text-[11px] text-dim shrink-0">{lang.tabs.length} flikar</span>
              <button
                onClick={() => { setEditingId(lang.id); setDeletingId(null) }}
                className="rounded p-1 text-dim hover:text-muted transition-colors"
                title="Redigera"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={() => { setDeletingId(lang.id); setEditingId(null) }}
                className="rounded p-1 text-dim hover:text-rose transition-colors"
                title="Ta bort"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <AddLanguageForm />
      </div>
    </div>
  )
}

// ─── LinguisticsHome ──────────────────────────────────────────────────────────

export default function LinguisticsHome() {
  const ref     = useFadeIn()
  const gridRef = useStaggerIn(0.06)
  const navigate = useNavigate()
  const { languages, docCategories, notes, grammarEntries, readingLog } = useLinguisticsStore()

  const [managing,    setManaging]    = useState(false)
  const [pullStatus,  setPullStatus]  = useState(null)

  const totalDocs  = docCategories.reduce((sum, c) => sum + (c.docs?.length ?? 0), 0)
  const totalNotes = notes.length + grammarEntries.length

  async function handlePull() {
    setPullStatus('pulling')
    try {
      const ok = await pullAllCollections(PREFIX)
      setPullStatus(ok ? 'done' : 'empty')
      if (ok) setTimeout(() => window.location.reload(), 600)
      else    setTimeout(() => setPullStatus(null), 3000)
    } catch {
      setPullStatus('error')
      setTimeout(() => setPullStatus(null), 3000)
    }
  }

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-text">Lingvistik</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {totalDocs} dokument · {totalNotes} anteckningar · {readingLog.length} läsposter
          </p>
        </div>

        <div className="flex flex-col items-start gap-1.5 md:items-end">
          <div className="flex items-center gap-1.5">
            {/* Hantera-knapp */}
            <button
              onClick={() => setManaging(v => !v)}
              className={[
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-all',
                managing
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-surface text-muted hover:border-border2 hover:text-text',
              ].join(' ')}
            >
              <Settings size={12} className={managing ? 'text-accent' : ''} />
              Hantera
            </button>

            {/* Synkronisera-knapp */}
            <button
              onClick={handlePull}
              disabled={pullStatus === 'pulling'}
              title="Hämta senaste data från Supabase"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px] text-muted transition-all hover:border-border2 hover:text-text disabled:opacity-40"
            >
              <RefreshCw size={12} className={pullStatus === 'pulling' ? 'animate-spin' : ''} />
              {pullStatus === 'pulling' ? 'Hämtar…' : pullStatus === 'done' ? '✓ Klar' : 'Synkronisera'}
            </button>
          </div>
          {(pullStatus === 'empty' || pullStatus === 'error') && (
            <p className="font-mono text-[10px] text-dim">
              {pullStatus === 'empty' ? '// ingen data i Supabase' : '// fel vid hämtning'}
            </p>
          )}
        </div>
      </div>

      {/* ── Hanteringspanel ── */}
      {managing && (
        <div className="mt-6">
          <ManagePanel onClose={() => setManaging(false)} />
        </div>
      )}

      {/* ── Divider ── */}
      <div className={[managing ? 'mb-7' : 'mb-7 mt-5', 'flex items-center gap-3'].join(' ')}>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">— {languages.length} språk</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Language cards ── */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map(lang => {
          const langDocs    = docCategories.filter(c => c.language === lang.id).reduce((s, c) => s + (c.docs?.length ?? 0), 0)
          const langCats    = docCategories.filter(c => c.language === lang.id).length
          const langNotes   = notes.filter(n => n.language === lang.id).length
          const langReading = readingLog.filter(r => r.language === lang.id).length
          const bg          = lang.color + '12'
          const defaultTab  = lang.tabs[0]?.id ?? 'ordforrad'

          return (
            <button
              key={lang.id}
              onClick={() => navigate(`/lingvistik/${lang.id}/${defaultTab}`)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all duration-200 hover:border-[color:var(--lang-color)]/30 hover:shadow-sm"
              style={{ '--lang-color': lang.color }}
            >
              {/* Accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-0.5 transition-all duration-200 group-hover:w-1"
                style={{ backgroundColor: lang.color }}
              />

              <div className="p-6 pl-7">
                {/* Top */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className="mb-2 inline-flex items-center justify-center rounded-lg px-2 py-1 font-mono text-xs font-medium"
                      style={{ backgroundColor: bg, color: lang.color }}
                    >
                      {lang.flag}
                    </div>
                    <h2 className="font-display text-xl text-text">{lang.label}</h2>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {lang.tabs.map(t => t.label).join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat icon={FileText}   value={langDocs}    label="dokument"     color={lang.color} />
                  <Stat icon={Hash}       value={langCats}    label="kategorier"   color={lang.color} />
                  <Stat icon={BookOpen}   value={langNotes}   label="anteckningar" color={lang.color} />
                  <Stat icon={BookMarked} value={langReading} label="läsposter"    color={lang.color} />
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">
                    {langDocs === 0 ? '// inga dokument än' : `// ${langDocs} dokument i ${langCats} kategorier`}
                  </span>
                  <span
                    className="font-mono text-[11px] opacity-0 transition-all duration-200 group-hover:opacity-100"
                    style={{ color: lang.color }}
                  >
                    öppna →
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-lg border border-border bg-surface2 p-2.5 text-center">
      <p className="font-mono text-lg font-medium leading-none text-text">{value}</p>
      <p className="mt-1 font-mono text-[10px] text-muted">{label}</p>
    </div>
  )
}
