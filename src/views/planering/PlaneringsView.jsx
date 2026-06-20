import { useState, useRef, useEffect } from 'react'
import { Plus, X, Pencil, Trash2, ExternalLink, ZoomIn, ZoomOut, Settings, Check, ChevronsRight, ChevronUp, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePlaneringsStore } from '@/store'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const BASE_YEAR  = 2003
const DEFAULT_PX = 110
const MIN_PX     = 55
const MAX_PX     = 220
const ROW_H      = 72
const AXIS_H     = 36
const SIDE_PAD   = 80
const MAIN_Y     = 6
const MAIN_H     = 32
const SUB_Y      = 44
const SUB_H      = 20

const COLOR_PALETTE = [
  '#7c72f5', '#22d3ee', '#f97316', '#34d399',
  '#fbbf24', '#e11d48', '#a78bfa', '#fb923c',
  '#38bdf8', '#4ade80', '#f472b6', '#facc15',
]

const HUB_LINKS = [
  { label: '—',            value: '' },
  { label: 'Högskoleprov', value: '/hp' },
  { label: 'Lingvistik',   value: '/lingvistik' },
  { label: 'Projekt',      value: '/projekt' },
  { label: 'Engagemang',   value: '/engagemang' },
]

const BLANK_EPOCH = { title: '', category: '', startDate: '', endDate: '', notes: '', hubLink: '' }
const BLANK_SUB   = { title: '', startDate: '', endDate: '', color: '' }

// ─── CSS-variabel hjälpare (för inline styles) ────────────────────────────────

const CV = {
  bg:      'rgb(var(--color-bg))',
  surface: 'rgb(var(--color-surface))',
  surf2:   'rgb(var(--color-surface2))',
  border:  'rgb(var(--color-border))',
  border2: 'rgb(var(--color-border2))',
  text:    'rgb(var(--color-text))',
  muted:   'rgb(var(--color-muted))',
  dim:     'rgb(var(--color-dim))',
}

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

function dateToFrac(d) {
  if (!d) return 0
  const dt = new Date(d)
  return dt.getFullYear() + (dt.getMonth() + dt.getDate() / 31) / 12
}

function isFuture(d) { return d && new Date(d) > new Date() }

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })
}

function duration(start, end) {
  if (!start) return ''
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const months = Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.5))
  if (months < 1) return '< 1 mån'
  if (months < 12) return `${months} mån`
  const y = Math.floor(months / 12), m = months % 12
  return m > 0 ? `${y} år ${m} mån` : `${y} år`
}

function lighten(hex, amount = 0.1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r+(255-r)*amount)},${Math.round(g+(255-g)*amount)},${Math.round(b+(255-b)*amount)})`
}

// ─── PlaneringsView ───────────────────────────────────────────────────────────

export default function PlaneringsView() {
  const navigate = useNavigate()
  const {
    epochs, addEpoch, updateEpoch, removeEpoch,
    epochCats, addEpochCat, updateEpochCat, removeEpochCat,
    subEpochs, addSubEpoch, updateSubEpoch, removeSubEpoch,
  } = usePlaneringsStore()

  const [pxPerYear,  setPxPerYear]  = useState(DEFAULT_PX)
  const [selected,   setSelected]   = useState(null)
  const [editForm,   setEditForm]   = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [addForm,    setAddForm]    = useState({ ...BLANK_EPOCH })
  const [showCatMgr, setShowCatMgr] = useState(false)

  const scrollRef = useRef(null)

  useEffect(() => {
    if (epochCats.length > 0 && !addForm.category) {
      setAddForm(f => ({ ...f, category: epochCats[0].id }))
    }
  }, [epochCats]) // eslint-disable-line

  useEffect(() => {
    if (!scrollRef.current) return
    const now = dateToFrac(new Date().toISOString().slice(0, 10))
    const x   = (now - BASE_YEAR) * pxPerYear + SIDE_PAD - scrollRef.current.clientWidth * 0.4
    scrollRef.current.scrollLeft = Math.max(0, x)
  }, []) // eslint-disable-line

  const cats    = [...epochCats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const nowFrac = dateToFrac(new Date().toISOString().slice(0, 10))

  const allFracs = epochs.flatMap(ep => [
    ep.startDate ? dateToFrac(ep.startDate) : null,
    ep.endDate   ? dateToFrac(ep.endDate)   : null,
  ]).filter(Boolean)
  const fracMin = Math.min(...allFracs, BASE_YEAR, nowFrac - 0.5) - 0.5
  const fracMax = Math.max(...allFracs, nowFrac + 1) + 2
  const totalW  = (fracMax - fracMin) * pxPerYear + SIDE_PAD * 2
  const totalH  = AXIS_H + cats.length * ROW_H + 24

  function toX(frac) { return (frac - fracMin) * pxPerYear + SIDE_PAD }

  const years = Array.from(
    { length: Math.ceil(fracMax) - Math.floor(fracMin) + 1 },
    (_, i) => Math.floor(fracMin) + i
  )

  function handleAddSubmit(e) {
    e.preventDefault()
    addEpoch({ ...addForm, category: addForm.category || cats[0]?.id || '' })
    setShowModal(false)
    setAddForm({ ...BLANK_EPOCH, category: cats[0]?.id || '' })
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    updateEpoch(selected.id, editForm)
    setSelected(s => ({ ...s, ...editForm }))
    setEditForm(null)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">

      {/* ── Topprad ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div>
          <p className="font-display text-[13px] font-bold text-text tracking-tight">Livskarta</p>
          <p className="font-mono text-[10px] text-dim">Scrollbar tidslinje · klicka för detaljer</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface2 px-2 py-1.5">
            <button onClick={() => setPxPerYear(p => Math.max(MIN_PX, p - 20))}
              className="rounded p-0.5 text-dim transition hover:text-muted"><ZoomOut size={13} /></button>
            <span className="w-8 text-center font-mono text-[10px] text-muted">
              {Math.round(pxPerYear / DEFAULT_PX * 100)}%
            </span>
            <button onClick={() => setPxPerYear(p => Math.min(MAX_PX, p + 20))}
              className="rounded p-0.5 text-dim transition hover:text-muted"><ZoomIn size={13} /></button>
          </div>
          <button
            onClick={() => setShowCatMgr(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface2 px-3 py-2 font-mono text-[11px] text-muted transition hover:bg-surface hover:text-text"
          >
            <Settings size={12} /> Kategorier
          </button>
          <button
            onClick={() => { setAddForm({ ...BLANK_EPOCH, category: cats[0]?.id || '' }); setShowModal(true) }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={12} /> Ny epok
          </button>
        </div>
      </div>

      {/* ── Canvas + panel ── */}
      <div className="relative flex min-h-0 flex-1">

        {/* Scrollbar tidslinje */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width: totalW, height: totalH, position: 'relative', minWidth: '100%', background: CV.bg }}>

            {/* Årsaxel */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: AXIS_H, borderBottom: `1px solid ${CV.border}` }}>
              {years.map(yr => {
                const x = toX(yr)
                const isNow = yr === Math.floor(nowFrac)
                return (
                  <div key={yr} style={{ position: 'absolute', left: x, top: 0 }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 22, width: 1, height: totalH - 22,
                      background: isNow ? CV.border2 : CV.border,
                    }} />
                    <span style={{
                      position: 'absolute', left: 4, top: 11,
                      fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                      color: isNow ? CV.muted : CV.dim,
                      whiteSpace: 'nowrap', userSelect: 'none',
                      fontWeight: isNow ? 600 : 400,
                    }}>{yr}</span>
                  </div>
                )
              })}
            </div>

            {/* Kategori-rader */}
            {cats.map((cat, ri) => {
              const top = AXIS_H + ri * ROW_H
              const catEpochs = epochs.filter(ep => ep.category === cat.id)

              return (
                <div key={cat.id} style={{ position: 'absolute', left: 0, right: 0, top, height: ROW_H }}>
                  {/* Rad-etikett (sticky) */}
                  <div style={{ position: 'sticky', left: 0, zIndex: 10, display: 'inline-flex', alignItems: 'center', height: ROW_H, paddingLeft: 12 }}>
                    <span style={{
                      background: CV.bg,
                      paddingRight: 10,
                      fontFamily: 'IBM Plex Mono, monospace', fontSize: 9,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: cat.color,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                      {cat.name}
                    </span>
                  </div>

                  {/* Rad-separator */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: CV.border }} />

                  {/* Epoker */}
                  {catEpochs.map(ep => {
                    const sx     = toX(dateToFrac(ep.startDate))
                    const ex     = ep.endDate ? toX(dateToFrac(ep.endDate)) : toX(nowFrac)
                    const w      = Math.max(ex - sx, 24)
                    const fut    = isFuture(ep.startDate)
                    const sel    = selected?.id === ep.id
                    const epSubs = subEpochs.filter(s => s.epochId === ep.id)

                    return (
                      <div key={ep.id} style={{ position: 'absolute', left: sx, top: 0, width: w, height: ROW_H }}>
                        {/* Huvud-block */}
                        <div
                          onClick={() => setSelected(s => s?.id === ep.id ? null : ep)}
                          title={ep.title}
                          style={{
                            position: 'absolute', left: 0, top: MAIN_Y, width: '100%', height: MAIN_H,
                            borderRadius: 7, cursor: 'pointer',
                            opacity: fut ? 0.35 : 1,
                            background: fut ? 'transparent' : cat.color + '18',
                            border: fut
                              ? `1.5px dashed ${cat.color}60`
                              : sel
                                ? `1.5px solid ${cat.color}`
                                : `1px solid ${cat.color}50`,
                            boxShadow: sel ? `0 0 0 3px ${cat.color}20` : 'none',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            display: 'flex', alignItems: 'center',
                            paddingLeft: 8, paddingRight: 8, overflow: 'hidden',
                          }}
                        >
                          {epSubs.length > 0 && (
                            <ChevronsRight size={9} style={{ flexShrink: 0, marginRight: 4, color: cat.color + '90' }} />
                          )}
                          <span style={{
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: Math.max(8, Math.min(11, w / Math.max(ep.title.length, 4) * 1.3)),
                            color: cat.color,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxWidth: '100%', userSelect: 'none',
                          }}>{ep.title}</span>
                        </div>

                        {/* Delepoker */}
                        {epSubs.map(sub => {
                          const subColor = sub.color || lighten(cat.color, 0.1)
                          const ssx = toX(dateToFrac(sub.startDate)) - sx
                          const sex = sub.endDate ? toX(dateToFrac(sub.endDate)) - sx : toX(nowFrac) - sx
                          const sw  = Math.max(sex - ssx, 16)
                          const subFut = isFuture(sub.startDate)
                          return (
                            <div key={sub.id} title={sub.title} style={{
                              position: 'absolute',
                              left: ssx, top: SUB_Y, width: sw, height: SUB_H,
                              borderRadius: 5,
                              background: subFut ? 'transparent' : subColor + '25',
                              border: subFut ? `1px dashed ${subColor}55` : `1px solid ${subColor}65`,
                              opacity: subFut ? 0.4 : 1,
                              display: 'flex', alignItems: 'center',
                              paddingLeft: 5, overflow: 'hidden',
                            }}>
                              <span style={{
                                fontFamily: 'IBM Plex Mono, monospace', fontSize: 8,
                                color: subColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                userSelect: 'none',
                              }}>{sub.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Nu-markör */}
            <div style={{
              position: 'absolute', left: toX(nowFrac), top: AXIS_H - 8, bottom: 0, width: 2,
              background: `linear-gradient(to bottom, ${CV.text}, transparent)`,
              opacity: 0.35,
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
                width: 6, height: 6, borderRadius: '50%',
                background: CV.text,
                opacity: 1,
              }} />
              <span style={{
                position: 'absolute', top: 8, left: 6,
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 9,
                color: CV.muted, whiteSpace: 'nowrap', userSelect: 'none', opacity: 1,
              }}>nu</span>
            </div>

          </div>
        </div>

        {/* Detaljpanel */}
        {selected && (
          <EpochPanel
            epoch={selected}
            cats={cats}
            subEpochs={subEpochs.filter(s => s.epochId === selected.id)}
            editForm={editForm}
            setEditForm={setEditForm}
            onUpdate={handleEditSubmit}
            onDelete={() => { removeEpoch(selected.id); setSelected(null) }}
            onClose={() => { setSelected(null); setEditForm(null) }}
            onNavigate={navigate}
            onAddSub={sub => addSubEpoch({ ...sub, epochId: selected.id })}
            onUpdateSub={updateSubEpoch}
            onRemoveSub={removeSubEpoch}
          />
        )}
      </div>

      {/* Kategori-hanterare */}
      {showCatMgr && (
        <CategoryManager
          cats={cats}
          onAdd={addEpochCat}
          onUpdate={updateEpochCat}
          onRemove={removeEpochCat}
          epochsCount={id => epochs.filter(ep => ep.category === id).length}
          onClose={() => setShowCatMgr(false)}
        />
      )}

      {/* Lägg till-modal */}
      {showModal && (
        <EpochModal
          form={addForm}
          setForm={setAddForm}
          cats={cats}
          onSubmit={handleAddSubmit}
          onClose={() => { setShowModal(false); setAddForm({ ...BLANK_EPOCH, category: cats[0]?.id || '' }) }}
        />
      )}
    </div>
  )
}

// ─── EpochPanel ───────────────────────────────────────────────────────────────

function EpochPanel({ epoch, cats, subEpochs, editForm, setEditForm, onUpdate, onDelete, onClose, onNavigate, onAddSub, onUpdateSub, onRemoveSub }) {
  const cat     = cats.find(c => c.id === epoch.category) ?? cats[0] ?? { color: '#7c72f5', name: '' }
  const editing = !!editForm
  const fut     = isFuture(epoch.startDate)

  const [subForm,    setSubForm]    = useState(null)
  const [editSubId,  setEditSubId]  = useState(null)
  const [editSubFrm, setEditSubFrm] = useState(null)

  function openAddSub() { setSubForm({ ...BLANK_SUB, color: '' }); setEditSubId(null) }
  function submitAddSub(e) { e.preventDefault(); onAddSub(subForm); setSubForm(null) }
  function startEditSub(sub) {
    setEditSubId(sub.id)
    setEditSubFrm({ title: sub.title, startDate: sub.startDate, endDate: sub.endDate || '', color: sub.color || '' })
    setSubForm(null)
  }
  function submitEditSub(e) { e.preventDefault(); onUpdateSub(editSubId, editSubFrm); setEditSubId(null); setEditSubFrm(null) }

  return (
    <div className="flex h-full w-full sm:w-80 shrink-0 flex-col overflow-hidden border-l border-border bg-surface">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
            <span className="font-mono text-[10px]" style={{ color: cat.color }}>{cat.name}</span>
            {fut && (
              <span className="rounded border px-1.5 py-0.5 font-mono text-[9px] text-dim"
                style={{ borderColor: cat.color + '50', borderStyle: 'dashed' }}>planerat</span>
            )}
          </div>
          <h2 className="font-display text-[14px] font-bold leading-snug text-text">{epoch.title}</h2>
          <p className="mt-0.5 font-mono text-[10px] text-dim">
            {fmtDate(epoch.startDate)}{epoch.endDate ? ` → ${fmtDate(epoch.endDate)}` : ' → nu'}
            {' · '}<span style={{ color: cat.color }}>{duration(epoch.startDate, epoch.endDate)}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          {!editing && (
            <button
              onClick={() => setEditForm({ title: epoch.title, category: epoch.category, startDate: epoch.startDate, endDate: epoch.endDate || '', notes: epoch.notes || '', hubLink: epoch.hubLink || '' })}
              className="rounded-lg p-1.5 text-dim transition hover:bg-surface2 hover:text-muted"
            ><Pencil size={12} /></button>
          )}
          <button onClick={onClose} className="rounded-lg p-1.5 text-dim transition hover:bg-surface2 hover:text-muted"><X size={12} /></button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {editing ? (
          <form onSubmit={onUpdate} className="space-y-3 p-5">
            <DField label="Titel"         value={editForm.title}     onChange={v => setEditForm(f => ({ ...f, title: v }))} required />
            <DSel   label="Kategori"      value={editForm.category}  onChange={v => setEditForm(f => ({ ...f, category: v }))} options={cats.map(c => ({ value: c.id, label: c.name }))} />
            <DField label="Startdatum"    value={editForm.startDate} onChange={v => setEditForm(f => ({ ...f, startDate: v }))} type="date" required />
            <DField label="Slutdatum"     value={editForm.endDate}   onChange={v => setEditForm(f => ({ ...f, endDate: v }))}   type="date" />
            <DArea  label="Anteckningar"  value={editForm.notes}     onChange={v => setEditForm(f => ({ ...f, notes: v }))} />
            <DSel   label="Länk till hub" value={editForm.hubLink}   onChange={v => setEditForm(f => ({ ...f, hubLink: v }))} options={HUB_LINKS.map(l => ({ value: l.value, label: l.label }))} />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 justify-center">Spara</button>
              <button type="button" onClick={() => setEditForm(null)} className="btn-ghost">Avbryt</button>
            </div>
          </form>
        ) : (
          <>
            {epoch.notes ? (
              <div className="px-5 pt-4 pb-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-dim">Anteckningar</p>
                <p className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-muted">{epoch.notes}</p>
              </div>
            ) : (
              <p className="px-5 pt-4 font-mono text-[11px] italic text-dim">Inga anteckningar ännu.</p>
            )}

            {/* Delepoker */}
            <div className="border-t border-border px-5 pt-4 pb-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                  Delepoker {subEpochs.length > 0 && <span style={{ color: cat.color }}>({subEpochs.length})</span>}
                </p>
                {!subForm && (
                  <button onClick={openAddSub} className="flex items-center gap-1 font-mono text-[10px] text-muted transition hover:text-text">
                    <Plus size={10} /> Lägg till
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {subEpochs.map(sub => {
                  const subColor = sub.color || cat.color
                  if (editSubId === sub.id) {
                    return (
                      <form key={sub.id} onSubmit={submitEditSub} className="rounded-lg border border-border bg-bg p-3 space-y-2">
                        <DField label="Namn" value={editSubFrm.title} onChange={v => setEditSubFrm(f => ({ ...f, title: v }))} required />
                        <div className="grid grid-cols-2 gap-2">
                          <DField label="Start" value={editSubFrm.startDate} onChange={v => setEditSubFrm(f => ({ ...f, startDate: v }))} type="date" required />
                          <DField label="Slut"  value={editSubFrm.endDate}   onChange={v => setEditSubFrm(f => ({ ...f, endDate: v }))}   type="date" />
                        </div>
                        <ColorRow value={editSubFrm.color} onChange={c => setEditSubFrm(f => ({ ...f, color: c }))} />
                        <div className="flex gap-2 pt-0.5">
                          <button type="submit" className="btn-primary flex-1 justify-center py-1.5 text-[10px]">Spara</button>
                          <button type="button" onClick={() => setEditSubId(null)} className="btn-ghost py-1.5 text-[10px]">Avbryt</button>
                        </div>
                      </form>
                    )
                  }
                  return (
                    <div key={sub.id} className="group flex items-center gap-2 rounded-lg px-2.5 py-2 transition hover:bg-surface2">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: subColor }} />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] text-text truncate">{sub.title}</p>
                        <p className="font-mono text-[9px] text-dim">
                          {fmtDate(sub.startDate)}{sub.endDate ? ` → ${fmtDate(sub.endDate)}` : ' → nu'}
                          {' · '}{duration(sub.startDate, sub.endDate)}
                        </p>
                      </div>
                      <button onClick={() => startEditSub(sub)} className="shrink-0 text-dim opacity-0 transition group-hover:opacity-100 hover:text-muted"><Pencil size={11} /></button>
                      <button onClick={() => onRemoveSub(sub.id)} className="shrink-0 text-dim opacity-0 transition group-hover:opacity-100 hover:text-rose"><Trash2 size={11} /></button>
                    </div>
                  )
                })}
              </div>

              {subForm && (
                <form onSubmit={submitAddSub} className="mt-2 rounded-lg border border-border bg-bg p-3 space-y-2">
                  <DField label="Namn" value={subForm.title} onChange={v => setSubForm(f => ({ ...f, title: v }))} required placeholder="t.ex. BT, ST, Kurs 1…" />
                  <div className="grid grid-cols-2 gap-2">
                    <DField label="Start" value={subForm.startDate} onChange={v => setSubForm(f => ({ ...f, startDate: v }))} type="date" required />
                    <DField label="Slut"  value={subForm.endDate}   onChange={v => setSubForm(f => ({ ...f, endDate: v }))}   type="date" />
                  </div>
                  <ColorRow value={subForm.color} onChange={c => setSubForm(f => ({ ...f, color: c }))} />
                  <div className="flex gap-2 pt-0.5">
                    <button type="submit" className="btn-primary flex-1 justify-center py-1.5 text-[10px]">Lägg till</button>
                    <button type="button" onClick={() => setSubForm(null)} className="btn-ghost py-1.5 text-[10px]">Avbryt</button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {!editing && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          {epoch.hubLink ? (
            <button onClick={() => onNavigate(epoch.hubLink)} className="flex items-center gap-1.5 font-mono text-[10px] text-muted transition hover:text-text">
              <ExternalLink size={10} /> Öppna i hubben
            </button>
          ) : <span />}
          <button onClick={onDelete} className="flex items-center gap-1 font-mono text-[10px] text-dim transition hover:text-rose">
            <Trash2 size={10} /> Ta bort
          </button>
        </div>
      )}
    </div>
  )
}

// ─── CategoryManager ──────────────────────────────────────────────────────────

function CategoryManager({ cats, onAdd, onUpdate, onRemove, epochsCount, onClose }) {
  const [newName,   setNewName]   = useState('')
  const [newColor,  setNewColor]  = useState(COLOR_PALETTE[cats.length % COLOR_PALETTE.length])
  const [editId,    setEditId]    = useState(null)
  const [editName,  setEditName]  = useState('')
  const [editColor, setEditColor] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    onAdd({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(COLOR_PALETTE[(cats.length + 1) % COLOR_PALETTE.length])
  }
  function startEdit(cat) { setEditId(cat.id); setEditName(cat.name); setEditColor(cat.color) }
  function saveEdit(id) { onUpdate(id, { name: editName.trim() || editName, color: editColor }); setEditId(null) }
  function moveUp(i) {
    if (i === 0) return
    onUpdate(cats[i].id,     { order: i - 1 })
    onUpdate(cats[i - 1].id, { order: i })
  }
  function moveDown(i) {
    if (i === cats.length - 1) return
    onUpdate(cats[i].id,     { order: i + 1 })
    onUpdate(cats[i + 1].id, { order: i })
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-text/10 backdrop-blur-sm">
      <div className="w-full max-w-[420px] mx-4 rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-[13px] font-bold text-text">Hantera kategorier</h3>
          <button onClick={onClose} className="text-dim transition hover:text-muted"><X size={14} /></button>
        </div>
        <div className="mb-4 space-y-2">
          {cats.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2.5">
              {editId === cat.id ? (
                <>
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent" />
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditId(null) }}
                    className="flex-1 bg-transparent font-mono text-[12px] text-text outline-none" />
                  <button onClick={() => saveEdit(cat.id)} className="text-muted transition hover:text-green"><Check size={13} /></button>
                  <button onClick={() => setEditId(null)} className="text-dim transition hover:text-muted"><X size={13} /></button>
                </>
              ) : (
                <>
                  {/* Flytta upp/ned */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="text-dim transition hover:text-muted disabled:opacity-20 disabled:cursor-default"
                    ><ChevronUp size={12} /></button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === cats.length - 1}
                      className="text-dim transition hover:text-muted disabled:opacity-20 disabled:cursor-default"
                    ><ChevronDown size={12} /></button>
                  </div>
                  <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat.color }} />
                  <span className="flex-1 font-mono text-[12px] text-text">{cat.name}</span>
                  <span className="font-mono text-[10px] text-dim">{epochsCount(cat.id)} epoker</span>
                  <button onClick={() => startEdit(cat)} className="text-dim transition hover:text-muted"><Pencil size={12} /></button>
                  <button
                    onClick={() => { if (epochsCount(cat.id) === 0) onRemove(cat.id) }}
                    title={epochsCount(cat.id) > 0 ? 'Har epoker — kan inte tas bort' : 'Ta bort'}
                    className={epochsCount(cat.id) > 0 ? 'cursor-not-allowed text-border2' : 'text-dim transition hover:text-rose'}
                  ><Trash2 size={12} /></button>
                </>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAdd} className="flex items-center gap-2 border-t border-border pt-4">
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent" />
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ny kategori…"
            className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[11px] text-text placeholder-dim outline-none transition focus:border-border2" />
          <button type="submit" disabled={!newName.trim()}
            className="btn-primary flex items-center gap-1 disabled:opacity-30">
            <Plus size={12} /> Lägg till
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {COLOR_PALETTE.map(c => (
            <button key={c} onClick={() => setNewColor(c)}
              className="h-5 w-5 rounded-full ring-1 ring-border transition hover:scale-110"
              style={{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── EpochModal ───────────────────────────────────────────────────────────────

function EpochModal({ form, setForm, cats, onSubmit, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-text/10 backdrop-blur-sm">
      <div className="w-full max-w-[400px] mx-4 rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-[13px] font-bold text-text">Ny epok</h3>
          <button onClick={onClose} className="text-dim transition hover:text-muted"><X size={14} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <DField label="Titel" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required placeholder="t.ex. Gymnasiet, Volontärarbete i Italien…" />
          <DSel   label="Kategori" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={cats.map(c => ({ value: c.id, label: c.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <DField label="Startdatum" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="date" required />
            <DField label="Slutdatum (tom = pågående)" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type="date" />
          </div>
          <DArea  label="Anteckningar" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Reflektioner, mål, minnen…" />
          <DSel   label="Länk till hubsektion" value={form.hubLink} onChange={v => setForm(f => ({ ...f, hubLink: v }))} options={HUB_LINKS.map(l => ({ value: l.value, label: l.label }))} />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Lägg till</button>
            <button type="button" onClick={onClose} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Färgväljare ──────────────────────────────────────────────────────────────

function ColorRow({ value, onChange }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">Färg</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#7c72f5'} onChange={e => onChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border bg-bg" />
        <div className="flex flex-wrap gap-1">
          {COLOR_PALETTE.slice(0, 8).map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className="h-4 w-4 rounded-full ring-1 ring-border transition hover:scale-110"
              style={{ background: c, outline: value === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Formulärhjälpare ─────────────────────────────────────────────────────────

function DField({ label, value, onChange, required, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">{label}</label>
      <input type={type}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[11px] text-text placeholder-dim outline-none transition focus:border-border2"
        value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </div>
  )
}

function DArea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">{label}</label>
      <textarea
        className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 font-sans text-[11px] text-text placeholder-dim outline-none transition focus:border-border2"
        rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function DSel({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">{label}</label>
      <select
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[11px] text-text outline-none transition focus:border-border2"
        value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
