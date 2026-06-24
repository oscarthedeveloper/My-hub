import { useState } from 'react'
import { Plus, Settings, X, Check, Trash2, Pencil } from 'lucide-react'
import { useVardagsStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const DAYS       = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag']
const DAYS_SHORT = ['Mån','Tis','Ons','Tor','Fre','Lör','Sön']
const GRID_START = 6
const GRID_END   = 23
const HOURS      = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i)
const PX_PER_HOUR = 64

const PRESET_COLORS = [
  '#7c72f5','#22d3ee','#34d399','#fbbf24',
  '#f97316','#e11d48','#a78bfa','#ec4899',
  '#06b6d4','#84cc16','#f472b6','#fb923c',
]

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

function timeToMinutes(t) {
  const [h, m] = (t || '00:00').split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function roundToSlot(min, slot = 15) {
  return Math.round(min / slot) * slot
}

// ─── ColorPicker ──────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full transition-transform hover:scale-110"
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

// ─── CategoryManager ──────────────────────────────────────────────────────────

function CategoryManager({ onClose }) {
  const { categories, addCategory, updateCategory, removeCategory } = useVardagsStore()
  const [editId, setEditId]     = useState(null)
  const [editForm, setEditForm] = useState({})
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const inputCls = 'w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all'

  function startEdit(cat) {
    setEditId(cat.id)
    setEditForm({ name: cat.name, color: cat.color })
  }

  function saveEdit() {
    if (!editForm.name?.trim()) return
    updateCategory(editId, editForm)
    setEditId(null)
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    addCategory({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted">
          Hantera kategorier
        </span>
        <button onClick={onClose} className="rounded p-1 text-dim hover:text-muted transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="mb-4 space-y-1.5">
        {categories.length === 0 && (
          <p className="font-mono text-[11px] text-dim">// Inga kategorier ännu</p>
        )}
        {categories.map(cat =>
          editId === cat.id ? (
            <div key={cat.id} className="space-y-2 rounded-xl border border-border2 bg-surface2 p-2.5">
              <input
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
              <ColorPicker value={editForm.color} onChange={c => setEditForm(f => ({ ...f, color: c }))} />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent/20 transition-all"
                >
                  <Check size={11} /> Spara
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="rounded-lg border border-border px-2.5 py-1 font-mono text-[11px] text-muted hover:text-text transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <div key={cat.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface2 px-3 py-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="flex-1 font-mono text-[12px] text-text">{cat.name}</span>
              <button onClick={() => startEdit(cat)} className="rounded p-1 text-dim hover:text-muted transition-colors">
                <Pencil size={11} />
              </button>
              <button
                onClick={() => removeCategory(cat.id)}
                className="rounded p-1 text-dim hover:text-rose-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )
        )}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 border-t border-border pt-3">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Ny kategori…"
          className={inputCls}
        />
        <ColorPicker value={newColor} onChange={setNewColor} />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted hover:text-text disabled:opacity-30 transition-colors"
        >
          <Plus size={11} /> Lägg till
        </button>
      </form>
    </div>
  )
}

// ─── EventBlock ───────────────────────────────────────────────────────────────

function EventBlock({ event, category, onClick }) {
  const startMin  = timeToMinutes(event.startTime)
  const endMin    = timeToMinutes(event.endTime)
  const gridStart = GRID_START * 60
  const pxPerMin  = PX_PER_HOUR / 60
  const top       = (startMin - gridStart) * pxPerMin
  const height    = Math.max((endMin - startMin) * pxPerMin, 22)
  const color     = category?.color ?? '#7c72f5'
  const isShort   = height < 36

  return (
    <div
      data-event="true"
      onClick={e => { e.stopPropagation(); onClick() }}
      className="absolute left-0.5 right-0.5 cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-80"
      style={{
        top:             `${top}px`,
        height:          `${height}px`,
        backgroundColor: `${color}22`,
        borderLeft:      `3px solid ${color}`,
        zIndex:          2,
      }}
    >
      <div className="px-1 py-0.5">
        <p className="truncate font-mono text-[9px] font-medium leading-tight" style={{ color }}>
          {event.title}
        </p>
        {!isShort && (
          <p className="font-mono text-[8px] leading-tight" style={{ color: `${color}bb` }}>
            {event.startTime}–{event.endTime}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── WeekCalendar ─────────────────────────────────────────────────────────────

function WeekCalendar({ events, categories, onAddEvent, onEditEvent, mobileDay, setMobileDay }) {
  const totalHeight = (GRID_END - GRID_START) * PX_PER_HOUR

  function getCat(id) {
    return categories.find(c => c.id === id)
  }

  function handleColumnClick(e, dayIdx) {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const minuteFromStart = roundToSlot(Math.max(0, y / (PX_PER_HOUR / 60)), 15)
    const startAbsMin = Math.min(GRID_START * 60 + minuteFromStart, (GRID_END - 1) * 60)
    const endAbsMin   = Math.min(startAbsMin + 60, GRID_END * 60)
    onAddEvent({
      day:       dayIdx,
      startTime: minutesToTime(startAbsMin),
      endTime:   minutesToTime(endAbsMin),
    })
  }

  // Tidkolumn — återanvänds i båda layouts
  const TimeColumn = () => (
    <div className="relative w-10 shrink-0 select-none">
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute right-1 font-mono text-[9px] leading-none text-dim"
          style={{ top: (h - GRID_START) * PX_PER_HOUR - 5 }}
        >
          {String(h).padStart(2, '0')}
        </div>
      ))}
    </div>
  )

  // En dagkolumn — återanvänds i båda layouts
  const DayColumn = ({ dayIdx, fullWidth = false }) => (
    <div
      className={[
        'relative cursor-pointer border-l border-border',
        fullWidth ? 'flex-1' : '',
      ].join(' ')}
      style={{ minWidth: fullWidth ? undefined : 60 }}
      onClick={e => handleColumnClick(e, dayIdx)}
    >
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute w-full border-t border-border/40"
          style={{ top: (h - GRID_START) * PX_PER_HOUR }}
        />
      ))}
      {HOURS.map(h => (
        <div
          key={h + '.5'}
          className="absolute w-full border-t border-border/20"
          style={{ top: (h - GRID_START) * PX_PER_HOUR + PX_PER_HOUR / 2 }}
        />
      ))}
      {events
        .filter(ev => ev.day === dayIdx)
        .map(ev => (
          <EventBlock
            key={ev.id}
            event={ev}
            category={getCat(ev.categoryId)}
            onClick={() => onEditEvent(ev)}
          />
        ))}
    </div>
  )

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">

      {/* ── Mobilvy: dag-flikar + en kolumn ── */}
      <div className="md:hidden">

        {/* Dag-flikar */}
        <div className="flex border-b border-border bg-surface2">
          <div className="w-10 shrink-0" />
          {DAYS_SHORT.map((d, i) => {
            const isActive = mobileDay === i
            const dayEvents = events.filter(ev => ev.day === i)
            return (
              <button
                key={i}
                onClick={() => setMobileDay(i)}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
              >
                <span
                  className="font-mono text-[11px] font-medium leading-none transition-colors"
                  style={{ color: isActive ? 'rgb(var(--color-text))' : 'rgb(var(--color-dim))' }}
                >
                  {d}
                </span>
                {/* Antal event-prickar */}
                {dayEvents.length > 0 && (
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? 'rgb(var(--color-text))'
                        : 'rgb(var(--color-border2))',
                    }}
                  />
                )}
                {/* Aktiv-indikator */}
                {isActive && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-text" />
                )}
              </button>
            )
          })}
        </div>

        {/* Enskild dagkolumn */}
        <div className="flex" style={{ height: totalHeight }}>
          <TimeColumn />
          <DayColumn dayIdx={mobileDay} fullWidth />
        </div>
      </div>

      {/* ── Desktopvy: 7-kolumns-grid ── */}
      <div className="hidden md:block overflow-x-auto">
        <div style={{ minWidth: 560 }}>

          {/* Rubrikrad */}
          <div className="sticky top-0 z-10 flex border-b border-border bg-surface2">
            <div className="w-10 shrink-0" />
            {DAYS.map((day, i) => (
              <div key={i} className="flex-1 border-l border-border py-2 text-center" style={{ minWidth: 60 }}>
                <span className="font-mono text-[11px] font-medium text-muted">{day}</span>
              </div>
            ))}
          </div>

          {/* Tidsgrid */}
          <div className="flex" style={{ height: totalHeight }}>
            <TimeColumn />
            {DAYS.map((_, dayIdx) => (
              <DayColumn key={dayIdx} dayIdx={dayIdx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AddEventPanel ────────────────────────────────────────────────────────────

function AddEventPanel({ initial, categories, onSave, onDelete, onClose }) {
  const isEdit = !!initial?.id

  const [form, setForm] = useState({
    title:      initial?.title      ?? '',
    day:        initial?.day        ?? 0,
    startTime:  initial?.startTime  ?? '08:00',
    endTime:    initial?.endTime    ?? '09:00',
    categoryId: initial?.categoryId ?? (categories[0]?.id ?? ''),
  })

  const inputCls = 'w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all'

  function setF(key) {
    return e => setForm(p => ({ ...p, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, day: Number(form.day) })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative mx-4 mb-4 w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[12px] font-medium text-text">
            {isEdit ? 'Redigera aktivitet' : 'Ny aktivitet'}
          </span>
          <button onClick={onClose} className="rounded-lg p-1 text-dim hover:text-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={form.title}
            onChange={setF('title')}
            placeholder="Titel…"
            required
            autoFocus
            className={inputCls}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] text-dim">Dag</label>
              <select
                value={form.day}
                onChange={e => setForm(p => ({ ...p, day: Number(e.target.value) }))}
                className={inputCls}
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] text-dim">Kategori</label>
              <select value={form.categoryId} onChange={setF('categoryId')} className={inputCls}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                {categories.length === 0 && <option value="">Ingen kategori</option>}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] text-dim">Starttid</label>
              <input type="time" value={form.startTime} onChange={setF('startTime')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] text-dim">Sluttid</label>
              <input type="time" value={form.endTime} onChange={setF('endTime')} className={inputCls} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!form.title.trim()}
              className="flex-1 rounded-xl bg-accent/10 py-2.5 font-mono text-[12px] text-accent ring-1 ring-accent/20 transition-all hover:bg-accent/20 disabled:opacity-30"
            >
              {isEdit ? 'Spara ändringar' : 'Lägg till'}
            </button>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-rose-500/30 px-3 py-2.5 font-mono text-[12px] text-rose-400 transition-all hover:bg-rose-500/10"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── SomedaySection ───────────────────────────────────────────────────────────

function SomedaySection({ items, categories }) {
  const { addSomedayItem, removeSomedayItem } = useVardagsStore()
  const [title, setTitle]           = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')

  // Synka default-kategori när kategorier laddas
  if (!categoryId && categories.length > 0) setCategoryId(categories[0].id)

  const inputCls = 'rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-accent/50 transition-all'

  function getCat(id) {
    return categories.find(c => c.id === id)
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    addSomedayItem({ title: title.trim(), categoryId })
    setTitle('')
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Someday</span>
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[11px] text-dim">{items.length} poster</span>
      </div>

      {items.length === 0 && (
        <p className="mb-4 font-mono text-[11px] text-dim">
          // Saker du vill göra men inte vet exakt när — t.ex. Läsa eller Plugga HP
        </p>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map(item => {
            const cat = getCat(item.categoryId)
            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 rounded-xl border bg-surface px-3 py-2"
                style={{ borderColor: cat ? `${cat.color}40` : 'rgb(var(--color-border))' }}
              >
                {cat && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <span className="font-mono text-[12px] text-text">{item.title}</span>
                {cat && (
                  <span className="font-mono text-[10px] text-dim">{cat.name}</span>
                )}
                <button
                  onClick={() => removeSomedayItem(item.id)}
                  className="ml-1 rounded p-0.5 text-dim opacity-0 transition-all group-hover:opacity-100 hover:text-rose-400"
                >
                  <X size={10} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Vad vill du göra en dag?"
          className={inputCls + ' min-w-[180px] flex-1'}
        />
        {categories.length > 0 && (
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:text-text disabled:opacity-30"
        >
          <Plus size={11} /> Lägg till
        </button>
      </form>
    </section>
  )
}

// ─── VardagskarteView ─────────────────────────────────────────────────────────

export default function VardagskarteView() {
  const ref = useFadeIn()
  const { categories, events, somedayItems, addEvent, updateEvent, removeEvent } = useVardagsStore()

  // Initieras på dagens veckodag (0=Mån … 6=Sön)
  const [mobileDay, setMobileDay] = useState(() => {
    const jsDay = new Date().getDay() // 0=Sön, 1=Mån, …, 6=Lör
    return jsDay === 0 ? 6 : jsDay - 1
  })
  const [managingCats, setManagingCats] = useState(false)
  const [panel, setPanel]               = useState(null)    // presets för nytt event
  const [editingEvent, setEditingEvent] = useState(null)    // event som redigeras

  function openAdd(presets) {
    setEditingEvent(null)
    setPanel(presets)
  }

  function openEdit(event) {
    setPanel(null)
    setEditingEvent(event)
  }

  function handleSave(form) {
    if (editingEvent) {
      updateEvent(editingEvent.id, form)
    } else {
      addEvent(form)
    }
    setPanel(null)
    setEditingEvent(null)
  }

  function handleDelete() {
    if (editingEvent) removeEvent(editingEvent.id)
    setEditingEvent(null)
  }

  return (
    <div ref={ref} className="min-h-dvh p-4 pb-24 md:p-8 md:pb-24">

      {/* Rubrik */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-text">Vardagskarta</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {events.length} {events.length === 1 ? 'aktivitet' : 'aktiviteter'} · {somedayItems.length} someday-poster
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setManagingCats(v => !v)}
            className={[
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-all',
              managingCats
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-muted hover:text-text',
            ].join(' ')}
          >
            <Settings size={12} /> Kategorier
          </button>
          <button
            onClick={() => openAdd({ day: 0, startTime: '08:00', endTime: '09:00' })}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:text-text"
          >
            <Plus size={12} /> Ny aktivitet
          </button>
        </div>
      </div>

      {/* Kategori-chips */}
      {!managingCats && categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(cat => (
            <span
              key={cat.id}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px]"
              style={{
                borderColor:     `${cat.color}40`,
                backgroundColor: `${cat.color}14`,
                color:            cat.color,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Kategori-hanterare */}
      {managingCats && <CategoryManager onClose={() => setManagingCats(false)} />}

      {/* Kalender */}
      {categories.length === 0 ? (
        <div className="mb-8 rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="mb-2 font-mono text-sm text-muted">// Inga kategorier ännu</p>
          <p className="mb-5 font-mono text-[11px] text-dim">
            Skapa kategorier som Jobb, Rutin eller Hobby för att komma igång
          </p>
          <button
            onClick={() => setManagingCats(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-mono text-[12px] text-muted transition-colors hover:text-text"
          >
            <Settings size={12} /> Skapa kategorier
          </button>
        </div>
      ) : (
        <WeekCalendar
          events={events}
          categories={categories}
          onAddEvent={openAdd}
          onEditEvent={openEdit}
          mobileDay={mobileDay}
          setMobileDay={setMobileDay}
        />
      )}

      {/* Someday */}
      <SomedaySection items={somedayItems} categories={categories} />

      {/* Add/Edit-modal */}
      {(panel || editingEvent) && (
        <AddEventPanel
          initial={editingEvent ?? panel}
          categories={categories}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : null}
          onClose={() => { setPanel(null); setEditingEvent(null) }}
        />
      )}
    </div>
  )
}
