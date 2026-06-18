import { useState } from 'react'
import {
  Users, Globe, Plus, X, Check, ChevronDown, ChevronUp,
  Trash2, Pencil, Target, ListTodo, StickyNote, Info,
  CreditCard, ExternalLink, Calendar,
} from 'lucide-react'
import { useEngagemangStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const ACCENT = '#e11d48'
const PRIORITY_COLOR = { hög: '#e11d48', medel: '#fbbf24', låg: '#34d399' }
const FEE_STATUS = ['betald', 'obetald', 'ej aktuell']

// ─── Huvud-vy ─────────────────────────────────────────────────────────────────

export default function EngagemangView() {
  const ref = useFadeIn()
  const store = useEngagemangStore()
  const [tab, setTab] = useState('orgs')

  const openTodos = store.orgTodos.filter(t => !t.done).length

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* Header */}
      <div className="mb-2">
        <h1 className="font-display text-3xl text-text">Engagemang</h1>
        <p className="mt-1 font-mono text-xs text-muted">
          {store.organizations.length} organisationer · {store.platforms.length} plattformar
          {openTodos > 0 && <span className="text-amber"> · {openTodos} öppna uppgifter</span>}
        </p>
      </div>

      {/* Flikar */}
      <div className="mb-6 mt-5 flex gap-1 border-b border-border">
        {[
          ['orgs',      'Organisationer', store.organizations.length],
          ['platforms', 'Plattformar',    store.platforms.length],
        ].map(([id, label, count]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 font-mono text-[12px] transition-colors border-b-2 -mb-px',
              tab === id ? 'border-rose text-text' : 'border-transparent text-muted hover:text-text',
            ].join(' ')}
          >
            {label}
            <span className="rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={tab === id ? { backgroundColor: ACCENT + '18', color: ACCENT } : { color: 'rgb(var(--color-dim))' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'orgs'      && <OrgsTab      store={store} />}
      {tab === 'platforms' && <PlatformsTab store={store} />}
    </div>
  )
}

// ─── Organisations-flik ───────────────────────────────────────────────────────

function OrgsTab({ store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', short: '', role: '', color: '#e11d48',
    website: '', membershipFee: '', feeStatus: 'ej aktuell', feeRenewalDate: '', notes: '',
  })

  function handleAdd(e) {
    e.preventDefault()
    store.addOrganization({
      ...form,
      membershipFee: form.membershipFee ? Number(form.membershipFee) : null,
    })
    setForm({ name: '', short: '', role: '', color: '#e11d48', website: '', membershipFee: '', feeStatus: 'ej aktuell', feeRenewalDate: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Ny organisation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 rounded-xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Ny organisation</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Namn" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            </div>
            <Field label="Förkortning" value={form.short} onChange={v => setForm(f => ({ ...f, short: v }))} placeholder="MUF" />
            <Field label="Din roll" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="Ledamot, ordförande…" />
            <Field label="Webbplats" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} placeholder="https://…" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
              <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2" value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            <Field label="Medlemsavgift (kr)" value={form.membershipFee} onChange={v => setForm(f => ({ ...f, membershipFee: v }))} type="number" placeholder="0" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Avgiftsstatus</label>
              <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
                value={form.feeStatus} onChange={e => setForm(f => ({ ...f, feeStatus: e.target.value }))}>
                {FEE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Förnyelsedatum" value={form.feeRenewalDate} onChange={v => setForm(f => ({ ...f, feeRenewalDate: v }))} type="date" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {store.organizations.map(org => (
          <OrgCard key={org.id} org={org} store={store} />
        ))}
        {store.organizations.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="font-mono text-xs text-muted">// Inga organisationer ännu</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Organisationskort ────────────────────────────────────────────────────────

function OrgCard({ org, store }) {
  const [open,    setOpen]    = useState(false)
  const [subTab,  setSubTab]  = useState('oversikt')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [confirmDel, setConfirmDel] = useState(false)

  const todos = store.orgTodos.filter(t => t.orgId === org.id)
  const goals = store.orgGoals.filter(g => g.orgId === org.id)
  const openTodos = todos.filter(t => !t.done).length
  const doneGoals = goals.filter(g => g.done).length

  const feeColor = org.feeStatus === 'betald' ? '#34d399'
    : org.feeStatus === 'obetald' ? '#e11d48'
    : 'rgb(var(--color-dim))'

  function startEdit() {
    setEditForm({
      name: org.name, short: org.short ?? '', role: org.role ?? '',
      color: org.color ?? '#e11d48', website: org.website ?? '',
      membershipFee: org.membershipFee != null ? String(org.membershipFee) : '',
      feeStatus: org.feeStatus ?? 'ej aktuell',
      feeRenewalDate: org.feeRenewalDate ?? '',
      notes: org.notes ?? '',
    })
    setEditing(true)
  }

  function handleUpdate(e) {
    e.preventDefault()
    store.updateOrganization(org.id, {
      ...editForm,
      membershipFee: editForm.membershipFee ? Number(editForm.membershipFee) : null,
    })
    setEditing(false)
  }

  const SUB_TABS = [
    { id: 'oversikt', label: 'Översikt', icon: Info },
    { id: 'todos',    label: 'Att göra', icon: ListTodo,  badge: openTodos  },
    { id: 'goals',    label: 'Mål',      icon: Target,    badge: goals.length > 0 ? `${doneGoals}/${goals.length}` : null },
    { id: 'notes',    label: 'Anteckningar', icon: StickyNote },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all">

      {/* ── Kortets header ── */}
      <div
        className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-surface2/40"
        onClick={() => { setOpen(o => !o); setEditing(false) }}
      >
        {/* Färgprick */}
        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: org.color ?? ACCENT }} />

        {/* Namn */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[13px] font-medium text-text">{org.name}</p>
            {org.short && (
              <span className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{org.short}</span>
            )}
          </div>
          {org.role && <p className="font-mono text-[11px] text-muted">{org.role}</p>}
        </div>

        {/* Avgiftspill */}
        {org.feeStatus && org.feeStatus !== 'ej aktuell' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <CreditCard size={12} style={{ color: feeColor }} />
            <span className="font-mono text-[10px]" style={{ color: feeColor }}>
              {org.feeStatus}
              {org.membershipFee ? ` · ${org.membershipFee} kr` : ''}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {openTodos > 0 && (
            <span className="rounded bg-amber/10 px-1.5 py-0.5 font-mono text-[10px] text-amber">{openTodos} uppg.</span>
          )}
          {goals.length > 0 && (
            <span className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{doneGoals}/{goals.length} mål</span>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-muted">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* ── Expanderad panel ── */}
      {open && (
        <div className="border-t border-border">

          {/* Sub-navigation */}
          {!editing && (
            <div className="flex items-center justify-between border-b border-border px-5">
              <div className="flex gap-0">
                {SUB_TABS.map(({ id, label, icon: Icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => setSubTab(id)}
                    className={[
                      'flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-mono text-[11px] transition-colors -mb-px',
                      subTab === id ? 'border-rose text-text' : 'border-transparent text-muted hover:text-text',
                    ].join(' ')}
                  >
                    <Icon size={11} />
                    {label}
                    {badge != null && badge !== 0 && (
                      <span className="rounded px-1 font-mono text-[9px]"
                        style={subTab === id ? { backgroundColor: ACCENT + '18', color: ACCENT } : { color: 'rgb(var(--color-dim))' }}>
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 py-2">
                <button onClick={startEdit} className="rounded p-1.5 text-muted hover:text-text transition-colors"><Pencil size={12} /></button>
                <button onClick={() => setConfirmDel(true)} className="rounded p-1.5 text-muted hover:text-rose transition-colors"><Trash2 size={12} /></button>
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer"
                    className="rounded p-1.5 text-muted hover:text-text transition-colors" onClick={e => e.stopPropagation()}>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="px-5 py-4">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <p className="font-mono text-[11px] text-muted mb-2">// Redigera organisation</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Field label="Namn" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} required />
                  </div>
                  <Field label="Förkortning" value={editForm.short} onChange={v => setEditForm(f => ({ ...f, short: v }))} />
                  <Field label="Roll" value={editForm.role} onChange={v => setEditForm(f => ({ ...f, role: v }))} />
                  <Field label="Webbplats" value={editForm.website} onChange={v => setEditForm(f => ({ ...f, website: v }))} placeholder="https://…" />
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
                    <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2"
                      value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                  <Field label="Avgift (kr)" value={editForm.membershipFee} onChange={v => setEditForm(f => ({ ...f, membershipFee: v }))} type="number" />
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Avgiftsstatus</label>
                    <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none"
                      value={editForm.feeStatus} onChange={e => setEditForm(f => ({ ...f, feeStatus: e.target.value }))}>
                      {FEE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Field label="Förnyelsedatum" value={editForm.feeRenewalDate} onChange={v => setEditForm(f => ({ ...f, feeRenewalDate: v }))} type="date" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex items-center gap-1.5"><Check size={13} /> Spara</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Avbryt</button>
                </div>
              </form>
            ) : subTab === 'oversikt' ? (
              <OrgOverview org={org} feeColor={feeColor} />
            ) : subTab === 'todos' ? (
              <OrgTodos org={org} todos={todos} store={store} />
            ) : subTab === 'goals' ? (
              <OrgGoals org={org} goals={goals} store={store} />
            ) : (
              <OrgNotes org={org} store={store} />
            )}
          </div>
        </div>
      )}

      {/* Radera-bekräftelse */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setConfirmDel(false)}>
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="font-mono text-sm text-text mb-1">Ta bort {org.name}?</p>
            <p className="font-mono text-[11px] text-muted mb-4">Todos och mål raderas också.</p>
            <div className="flex gap-2">
              <button onClick={() => { store.removeOrganization(org.id); setConfirmDel(false) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20">
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

// ─── Översikt ─────────────────────────────────────────────────────────────────

function OrgOverview({ org, feeColor }) {
  const rows = [
    org.role            && ['Roll',          org.role],
    org.website         && ['Webb',          <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">{org.website} <ExternalLink size={10} /></a>],
    org.membershipFee   && ['Avgift',        `${org.membershipFee} kr / år`],
    org.feeStatus       && org.feeStatus !== 'ej aktuell' && ['Avgiftsstatus', <span style={{ color: feeColor }}>{org.feeStatus}</span>],
    org.feeRenewalDate  && ['Förnyas',       new Date(org.feeRenewalDate).toLocaleDateString('sv-SE')],
  ].filter(Boolean)

  return (
    <div>
      {rows.length > 0 ? (
        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <dt className="w-28 shrink-0 font-mono text-[11px] text-muted">{label}</dt>
              <dd className="font-mono text-[12px] text-text">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="font-mono text-[11px] text-dim">// Klicka på pennan för att fylla i detaljer</p>
      )}
    </div>
  )
}

// ─── Todos ────────────────────────────────────────────────────────────────────

function OrgTodos({ org, todos, store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text: '', priority: 'medel', dueDate: '' })

  function handleAdd(e) {
    e.preventDefault()
    store.addOrgTodo(org.id, form)
    setForm({ text: '', priority: 'medel', dueDate: '' })
    setShowForm(false)
  }

  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const pOrder = { hög: 0, medel: 1, låg: 2 }
    return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1)
  })

  return (
    <div className="space-y-2">
      {sorted.map(todo => (
        <div key={todo.id} className="flex items-start gap-3 group">
          <button
            onClick={() => store.updateOrgTodo(todo.id, { done: !todo.done })}
            className={[
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all',
              todo.done ? 'bg-green/20 text-green ring-1 ring-green/30' : 'border border-border2 hover:border-accent/40',
            ].join(' ')}
          >
            {todo.done && <Check size={9} strokeWidth={3} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={['font-mono text-[12px]', todo.done ? 'text-muted line-through' : 'text-text'].join(' ')}>
              {todo.text}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[9px]" style={{ color: PRIORITY_COLOR[todo.priority] ?? 'inherit' }}>
                {todo.priority}
              </span>
              {todo.dueDate && (
                <span className="font-mono text-[9px] text-dim flex items-center gap-0.5">
                  <Calendar size={8} /> {new Date(todo.dueDate).toLocaleDateString('sv-SE')}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => store.removeOrgTodo(todo.id)}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:text-rose transition-all">
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="mt-3 space-y-2 rounded-lg border border-border bg-surface2 p-3">
          <input
            autoFocus required
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Uppgift…"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          />
          <div className="flex gap-2">
            <select
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              <option value="hög">Hög prioritet</option>
              <option value="medel">Medel</option>
              <option value="låg">Låg</option>
            </select>
            <input
              type="date"
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
            <button type="submit" className="btn-primary py-1 px-2 text-[11px]">Lägg till</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost py-1 px-2 text-[11px]">Avbryt</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors mt-1">
          <Plus size={11} /> Ny uppgift
        </button>
      )}

      {todos.length === 0 && !showForm && (
        <p className="font-mono text-[11px] text-dim pt-1">// Inga uppgifter ännu</p>
      )}
    </div>
  )
}

// ─── Mål ─────────────────────────────────────────────────────────────────────

function OrgGoals({ org, goals, store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text: '', targetDate: '', notes: '' })
  const [editingId, setEditingId] = useState(null)
  const [editProgress, setEditProgress] = useState(0)

  function handleAdd(e) {
    e.preventDefault()
    store.addOrgGoal(org.id, form)
    setForm({ text: '', targetDate: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-3">
      {goals.map(goal => (
        <div key={goal.id} className="group rounded-lg border border-border bg-surface2 p-3">
          <div className="flex items-start gap-2">
            <button
              onClick={() => store.updateOrgGoal(goal.id, { done: !goal.done, progress: !goal.done ? 100 : goal.progress })}
              className={[
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all',
                goal.done ? 'bg-green/20 text-green ring-1 ring-green/30' : 'border border-border2 hover:border-accent/40',
              ].join(' ')}
            >
              {goal.done && <Check size={9} strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={['font-mono text-[12px]', goal.done ? 'text-muted line-through' : 'text-text'].join(' ')}>
                {goal.text}
              </p>
              {goal.targetDate && (
                <p className="font-mono text-[10px] text-dim mt-0.5 flex items-center gap-1">
                  <Calendar size={9} /> {new Date(goal.targetDate).toLocaleDateString('sv-SE')}
                </p>
              )}
              {/* Progress */}
              <div className="mt-2 flex items-center gap-2">
                {editingId === goal.id ? (
                  <>
                    <input
                      type="range" min={0} max={100} step={5}
                      value={editProgress}
                      onChange={e => setEditProgress(Number(e.target.value))}
                      className="flex-1 accent-rose"
                    />
                    <span className="font-mono text-[10px] text-muted w-8 tabular-nums">{editProgress}%</span>
                    <button className="font-mono text-[10px] text-accent"
                      onClick={() => { store.updateOrgGoal(goal.id, { progress: editProgress }); setEditingId(null) }}>
                      ok
                    </button>
                  </>
                ) : (
                  <button className="flex-1 group/prog flex items-center gap-2"
                    onClick={() => { setEditingId(goal.id); setEditProgress(goal.progress ?? 0) }}>
                    <div className="flex-1 h-1 rounded-full bg-border">
                      <div className="h-1 rounded-full transition-all"
                        style={{ width: `${goal.progress ?? 0}%`, backgroundColor: goal.done ? '#34d399' : org.color ?? ACCENT }} />
                    </div>
                    <span className="font-mono text-[10px] text-muted w-8 tabular-nums group-hover/prog:text-text">
                      {goal.progress ?? 0}%
                    </span>
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => store.removeOrgGoal(goal.id)}
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:text-rose transition-all">
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-lg border border-border bg-surface2 p-3 space-y-2">
          <input
            autoFocus required
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Mål…"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
              placeholder="Måldatum"
            />
            <button type="submit" className="btn-primary py-1 px-2 text-[11px]">Lägg till</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost py-1 px-2 text-[11px]">Avbryt</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors">
          <Plus size={11} /> Nytt mål
        </button>
      )}

      {goals.length === 0 && !showForm && (
        <p className="font-mono text-[11px] text-dim">// Inga mål ännu</p>
      )}
    </div>
  )
}

// ─── Anteckningar ─────────────────────────────────────────────────────────────

function OrgNotes({ org, store }) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(org.notes ?? '')

  return (
    <div>
      {editing ? (
        <div>
          <textarea
            autoFocus
            className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
            rows={6}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Fritext anteckningar…"
          />
          <div className="mt-2 flex gap-2">
            <button className="btn-primary flex items-center gap-1.5 text-[12px]"
              onClick={() => { store.updateOrganization(org.id, { notes }); setEditing(false) }}>
              <Check size={12} /> Spara
            </button>
            <button onClick={() => { setNotes(org.notes ?? ''); setEditing(false) }} className="btn-ghost text-[12px]">Avbryt</button>
          </div>
        </div>
      ) : (
        <div className="group">
          {org.notes ? (
            <p className="font-mono text-[12px] text-text whitespace-pre-wrap">{org.notes}</p>
          ) : (
            <p className="font-mono text-[11px] text-dim">// Inga anteckningar</p>
          )}
          <button onClick={() => setEditing(true)}
            className="mt-2 flex items-center gap-1 font-mono text-[11px] text-muted hover:text-text transition-colors">
            <Pencil size={10} /> {org.notes ? 'Redigera' : 'Lägg till anteckning'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Plattformar-flik ─────────────────────────────────────────────────────────

function PlatformsTab({ store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', goal: '', color: '#7c72f5', notes: '' })

  function handleAdd(e) {
    e.preventDefault()
    store.addPlatform(form)
    setForm({ name: '', url: '', goal: '', color: '#7c72f5', notes: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Ny plattform
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 rounded-xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Ny plattform</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Namn" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Field label="URL" value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} placeholder="https://…" />
            <Field label="Mål" value={form.goal} onChange={v => setForm(f => ({ ...f, goal: v }))} placeholder="Vad vill du uppnå?" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
              <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2"
                value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-3">
        {store.platforms.map(p => (
          <PlatformCard key={p.id} platform={p} store={store} />
        ))}
        {store.platforms.length === 0 && (
          <div className="col-span-3 rounded-xl border border-dashed border-border py-14 text-center">
            <p className="font-mono text-xs text-muted">// Inga plattformar ännu</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Plattformskort ───────────────────────────────────────────────────────────

function PlatformCard({ platform: p, store }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: p.name, url: p.url ?? '', goal: p.goal ?? '', color: p.color ?? '#7c72f5', notes: p.notes ?? '' })
  const [confirmDel, setConfirmDel] = useState(false)

  const today = new Date().toDateString()
  const checkinKey = `checkin_${p.id}`
  const [checked, setChecked] = useState(() => localStorage.getItem(checkinKey) === today)

  function toggleCheckin() {
    if (checked) { localStorage.removeItem(checkinKey); setChecked(false) }
    else { localStorage.setItem(checkinKey, today); setChecked(true) }
  }

  function handleUpdate(e) {
    e.preventDefault()
    store.updatePlatform(p.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="rounded-xl border border-border bg-surface p-4 space-y-2">
        <Field label="Namn" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
        <Field label="URL" value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} placeholder="https://…" />
        <Field label="Mål" value={form.goal} onChange={v => setForm(f => ({ ...f, goal: v }))} />
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Färg</label>
          <input type="color" className="h-8 w-full cursor-pointer rounded-lg border border-border bg-surface2"
            value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary text-[11px] py-1">Spara</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-[11px] py-1">Avbryt</button>
        </div>
      </form>
    )
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-border2">
      {/* Färgbar topplinje */}
      <div className="h-0.5 w-full" style={{ backgroundColor: p.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-medium text-text truncate">{p.name}</p>
            {p.goal && <p className="font-mono text-[10px] text-muted mt-0.5 truncate">{p.goal}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                className="rounded p-1 text-muted hover:text-text"><ExternalLink size={12} /></a>
            )}
            <button onClick={() => setEditing(true)} className="rounded p-1 text-muted hover:text-text"><Pencil size={12} /></button>
            <button onClick={() => setConfirmDel(true)} className="rounded p-1 text-muted hover:text-rose"><Trash2 size={12} /></button>
          </div>
        </div>

        <button
          onClick={toggleCheckin}
          className={[
            'w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] font-medium transition-all',
            checked ? 'bg-green/10 text-green ring-1 ring-green/20' : 'bg-surface2 text-muted hover:text-text ring-1 ring-border',
          ].join(' ')}
        >
          {checked ? <><Check size={11} /> Gjort idag</> : '+ Check in'}
        </button>

        {p.notes && <p className="mt-3 font-mono text-[10px] text-dim line-clamp-2">{p.notes}</p>}
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setConfirmDel(false)}>
          <div className="rounded-2xl border border-border bg-bg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="font-mono text-sm text-text mb-4">Ta bort {p.name}?</p>
            <div className="flex gap-2">
              <button onClick={() => { store.removePlatform(p.id); setConfirmDel(false) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20">
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

// ─── Hjälpkomponenter ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        required={required}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
