import { useState } from 'react'
import {
  Users, Plus, X, Check, ChevronDown, ChevronUp,
  Trash2, Pencil, Target, ListTodo, StickyNote, Info,
  CreditCard, ExternalLink, Calendar, UserPlus, Clock,
  AlertCircle, History,
} from 'lucide-react'
import { useEngagemangStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const ACCENT = '#e11d48'

const ORG_TYPES = ['Politisk', 'Ideell', 'Akademisk', 'Professionell', 'Social', 'Kulturell']
const ORG_TYPE_COLORS = {
  Politisk:      '#7c72f5',
  Ideell:        '#34d399',
  Akademisk:     '#22d3ee',
  Professionell: '#fbbf24',
  Social:        '#ec4899',
  Kulturell:     '#f97316',
}

const PRIORITY_COLOR = { hög: '#e11d48', medel: '#fbbf24', låg: '#34d399' }
const FEE_STATUS     = ['betald', 'obetald', 'ej aktuell']

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr)) / 86_400_000)
}

function formatRelative(dateStr) {
  const d = daysSince(dateStr)
  if (d === null) return ''
  if (d === 0) return 'idag'
  if (d === 1) return 'igår'
  if (d < 7)  return `${d} dagar sedan`
  if (d < 14) return '1 vecka sedan'
  if (d < 30) return `${Math.floor(d / 7)} veckor sedan`
  if (d < 60) return '1 månad sedan'
  return `${Math.floor(d / 30)} månader sedan`
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sv-SE')
}

function lastActiveColor(days) {
  if (days === null) return 'rgb(var(--color-dim))'
  if (days <= 7)  return '#34d399'
  if (days <= 30) return '#fbbf24'
  return '#e11d48'
}

// ─── Huvud-vy ─────────────────────────────────────────────────────────────────

export default function EngagemangView() {
  const ref   = useFadeIn()
  const store = useEngagemangStore()
  const [tab, setTab] = useState('orgs')

  const openTodos  = store.orgTodos.filter(t => !t.done).length
  const unpaidFees = store.organizations.filter(o => o.feeStatus === 'obetald').length

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* Rubrik */}
      <div className="mb-5">
        <h1 className="font-display text-3xl text-text">Engagemang</h1>
        <p className="mt-1 font-mono text-xs text-muted">
          {store.organizations.length} organisationer · {store.platforms.length} plattformar
          {openTodos > 0 && <span className="text-amber"> · {openTodos} öppna uppgifter</span>}
          {unpaidFees > 0 && <span className="text-rose"> · {unpaidFees} obetald avgift</span>}
        </p>
      </div>

      {/* Statistikpanel */}
      <StatsPanel store={store} />

      {/* Avgiftsvarningar */}
      <FeeAlerts organizations={store.organizations} />

      {/* Flikar */}
      <div className="mb-6 flex gap-1 border-b border-border">
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
              style={tab === id
                ? { backgroundColor: ACCENT + '18', color: ACCENT }
                : { color: 'rgb(var(--color-dim))' }}>
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

// ─── Statistikpanel ───────────────────────────────────────────────────────────

function StatsPanel({ store }) {
  const openTodos  = store.orgTodos.filter(t => !t.done).length
  const unpaidFees = store.organizations.filter(o => o.feeStatus === 'obetald').length
  const activeGoals = store.orgGoals.filter(g => !g.done).length
  const doneGoals   = store.orgGoals.filter(g => g.done).length

  const stats = [
    {
      label: 'Organisationer',
      value: store.organizations.length,
      sub:   `${store.platforms.length} plattformar`,
      icon:  Users,
      color: ACCENT,
    },
    {
      label: 'Öppna uppgifter',
      value: openTodos,
      sub:   openTodos > 0 ? 'att göra' : 'allt klart',
      icon:  ListTodo,
      color: openTodos > 0 ? '#fbbf24' : '#34d399',
      alert: openTodos > 0,
    },
    {
      label: 'Obetalda avgifter',
      value: unpaidFees,
      sub:   unpaidFees > 0 ? 'kräver åtgärd' : 'allt betalt',
      icon:  CreditCard,
      color: unpaidFees > 0 ? '#e11d48' : '#34d399',
      alert: unpaidFees > 0,
    },
    {
      label: 'Aktiva mål',
      value: activeGoals,
      sub:   `${doneGoals} klara`,
      icon:  Target,
      color: '#7c72f5',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Icon size={11} style={{ color: s.color }} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{s.label}</span>
            </div>
            <p
              className="font-display text-3xl leading-none"
              style={{ color: s.alert ? s.color : 'rgb(var(--color-text))' }}
            >
              {s.value}
            </p>
            <p className="mt-1 font-mono text-[10px] text-dim">{s.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Avgiftsvarningar ─────────────────────────────────────────────────────────

function FeeAlerts({ organizations }) {
  const unpaid = organizations.filter(o => o.feeStatus === 'obetald')
  if (unpaid.length === 0) return null

  return (
    <div className="mb-5 space-y-2">
      {unpaid.map(org => (
        <div
          key={org.id}
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: '#e11d4830', backgroundColor: '#e11d480a' }}
        >
          <AlertCircle size={13} style={{ color: '#e11d48' }} className="shrink-0" />
          <div className="flex-1 min-w-0 font-mono text-[12px]">
            <span className="font-medium text-text">{org.name}</span>
            <span className="text-muted ml-2">— obetald avgift</span>
            {org.membershipFee && <span className="text-muted"> · {org.membershipFee} kr</span>}
            {org.feeRenewalDate && (
              <span className="text-dim ml-2">
                <Calendar size={9} className="inline mr-0.5" />
                {formatDate(org.feeRenewalDate)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Organisations-flik ───────────────────────────────────────────────────────

const EMPTY_ORG = {
  name: '', short: '', orgType: '', role: '', color: '#e11d48',
  website: '', membershipFee: '', feeStatus: 'ej aktuell',
  feeRenewalDate: '', notes: '',
}

function OrgsTab({ store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_ORG)

  function handleAdd(e) {
    e.preventDefault()
    store.addOrganization({
      ...form,
      membershipFee: form.membershipFee ? Number(form.membershipFee) : null,
    })
    setForm(EMPTY_ORG)
    setShowForm(false)
  }

  const f = key => v => setForm(p => ({ ...p, [key]: v }))

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Ny organisation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 space-y-3 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Ny organisation</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Field label="Namn" value={form.name} onChange={f('name')} required />
            </div>
            <Field label="Förkortning" value={form.short} onChange={f('short')} placeholder="MUF" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Typ (valfritt)</label>
              <select
                className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
                value={form.orgType}
                onChange={e => setForm(p => ({ ...p, orgType: e.target.value }))}
              >
                <option value="">Ingen typ</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Field label="Din roll" value={form.role} onChange={f('role')} placeholder="Ledamot, ordförande…" />
            <Field label="Webbplats" value={form.website} onChange={f('website')} placeholder="https://…" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
              <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2"
                value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
            </div>
            <Field label="Medlemsavgift (kr)" value={form.membershipFee} onChange={f('membershipFee')} type="number" placeholder="0" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Avgiftsstatus</label>
              <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none"
                value={form.feeStatus} onChange={e => setForm(p => ({ ...p, feeStatus: e.target.value }))}>
                {FEE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Förnyelsedatum" value={form.feeRenewalDate} onChange={f('feeRenewalDate')} type="date" />
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
  const [open,       setOpen]       = useState(false)
  const [subTab,     setSubTab]     = useState('oversikt')
  const [editing,    setEditing]    = useState(false)
  const [editForm,   setEditForm]   = useState(null)
  const [confirmDel, setConfirmDel] = useState(false)

  const todos    = store.orgTodos.filter(t => t.orgId === org.id)
  const goals    = store.orgGoals.filter(g => g.orgId === org.id)
  const contacts = (store.contacts ?? []).filter(c => c.orgId === org.id)
  const logs     = (store.orgLogs  ?? []).filter(l => l.orgId === org.id)

  const openTodos = todos.filter(t => !t.done).length
  const doneGoals = goals.filter(g => g.done).length
  const color     = org.color ?? ACCENT

  const feeColor = org.feeStatus === 'betald'  ? '#34d399'
    : org.feeStatus === 'obetald' ? '#e11d48'
    : 'rgb(var(--color-dim))'

  function startEdit() {
    setEditForm({
      name: org.name, short: org.short ?? '', orgType: org.orgType ?? '',
      role: org.role ?? '', color, website: org.website ?? '',
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

  const ef = key => v => setEditForm(p => ({ ...p, [key]: v }))

  const SUB_TABS = [
    { id: 'oversikt',     label: 'Översikt',     icon: Info },
    { id: 'todos',        label: 'Att göra',     icon: ListTodo,  badge: openTodos  || null },
    { id: 'goals',        label: 'Mål',          icon: Target,    badge: goals.length > 0 ? `${doneGoals}/${goals.length}` : null },
    { id: 'kontakter',    label: 'Kontakter',    icon: Users,     badge: contacts.length || null },
    { id: 'logg',         label: 'Logg',         icon: Clock,     badge: logs.length     || null },
    { id: 'anteckningar', label: 'Anteckningar', icon: StickyNote },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all">

      {/* ── Kortets header ── */}
      <div
        className="flex cursor-pointer items-center gap-3 py-4 pr-4 pl-5 transition-colors hover:bg-surface2/40"
        style={{ borderLeft: `4px solid ${color}` }}
        onClick={() => { setOpen(o => !o); setEditing(false) }}
      >
        {/* Initialer-avatar */}
        <div
          className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-mono text-[11px] font-medium"
          style={{ backgroundColor: color + '1a', color }}
        >
          {(org.short ?? org.name).slice(0, 3).toUpperCase()}
        </div>

        {/* Namn + roll */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono text-[13px] font-medium text-text">{org.name}</p>
            {org.orgType && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[9px]"
                style={{
                  backgroundColor: (ORG_TYPE_COLORS[org.orgType] ?? '#888') + '1a',
                  color:            ORG_TYPE_COLORS[org.orgType] ?? 'rgb(var(--color-muted))',
                }}
              >
                {org.orgType}
              </span>
            )}
          </div>
          {org.role && <p className="font-mono text-[11px] text-muted">{org.role}</p>}
        </div>

        {/* Avgiftspill */}
        {org.feeStatus && org.feeStatus !== 'ej aktuell' && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <CreditCard size={11} style={{ color: feeColor }} />
            <span className="font-mono text-[10px]" style={{ color: feeColor }}>
              {org.feeStatus}{org.membershipFee ? ` · ${org.membershipFee} kr` : ''}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {openTodos > 0 && (
            <span className="rounded bg-amber/10 px-1.5 py-0.5 font-mono text-[10px] text-amber">{openTodos}</span>
          )}
          {goals.length > 0 && (
            <span className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{doneGoals}/{goals.length} mål</span>
          )}
        </div>

        <div className="shrink-0 text-muted">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* ── Expanderad panel ── */}
      {open && (
        <div className="border-t border-border">

          {!editing && (
            <div className="flex items-center justify-between border-b border-border px-5 overflow-x-auto">
              <div className="flex shrink-0">
                {SUB_TABS.map(({ id, label, icon: Icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => setSubTab(id)}
                    className={[
                      'flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-mono text-[11px] transition-colors -mb-px whitespace-nowrap',
                      subTab === id ? 'border-rose text-text' : 'border-transparent text-muted hover:text-text',
                    ].join(' ')}
                  >
                    <Icon size={11} />
                    {label}
                    {badge != null && badge !== 0 && (
                      <span
                        className="rounded px-1 font-mono text-[9px]"
                        style={subTab === id
                          ? { backgroundColor: ACCENT + '18', color: ACCENT }
                          : { color: 'rgb(var(--color-dim))' }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 py-2 shrink-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Field label="Namn" value={editForm.name} onChange={ef('name')} required />
                  </div>
                  <Field label="Förkortning" value={editForm.short} onChange={ef('short')} />
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Typ (valfritt)</label>
                    <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none"
                      value={editForm.orgType} onChange={e => setEditForm(p => ({ ...p, orgType: e.target.value }))}>
                      <option value="">Ingen typ</option>
                      {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <Field label="Roll" value={editForm.role} onChange={ef('role')} />
                  <Field label="Webbplats" value={editForm.website} onChange={ef('website')} placeholder="https://…" />
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
                    <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2"
                      value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} />
                  </div>
                  <Field label="Avgift (kr)" value={editForm.membershipFee} onChange={ef('membershipFee')} type="number" />
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Avgiftsstatus</label>
                    <select className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text outline-none"
                      value={editForm.feeStatus} onChange={e => setEditForm(p => ({ ...p, feeStatus: e.target.value }))}>
                      {FEE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Field label="Förnyelsedatum" value={editForm.feeRenewalDate} onChange={ef('feeRenewalDate')} type="date" />
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
            ) : subTab === 'kontakter' ? (
              <OrgKontakter org={org} contacts={contacts} store={store} />
            ) : subTab === 'logg' ? (
              <OrgLogg org={org} logs={logs} store={store} />
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
            <p className="font-mono text-[11px] text-muted mb-4">Todos, mål, kontakter och logg raderas också.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { store.removeOrganization(org.id); setConfirmDel(false) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20"
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

// ─── Översikt ─────────────────────────────────────────────────────────────────

function OrgOverview({ org, feeColor }) {
  const rows = [
    org.role           && ['Roll',          org.role],
    org.website        && ['Webb',          <a key="w" href={org.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">{org.website} <ExternalLink size={10} /></a>],
    org.membershipFee  && ['Avgift',        `${org.membershipFee} kr / år`],
    org.feeStatus && org.feeStatus !== 'ej aktuell' && ['Avgiftsstatus', <span key="s" style={{ color: feeColor }}>{org.feeStatus}</span>],
    org.feeRenewalDate && ['Förnyas',       formatDate(org.feeRenewalDate)],
    org.notes          && ['Anteckningar',  org.notes],
  ].filter(Boolean)

  return rows.length > 0 ? (
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
    const p = { hög: 0, medel: 1, låg: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  return (
    <div className="space-y-2">
      {sorted.map(todo => (
        <div key={todo.id} className="group flex items-start gap-3">
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
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono text-[9px]" style={{ color: PRIORITY_COLOR[todo.priority] ?? 'inherit' }}>
                {todo.priority}
              </span>
              {todo.dueDate && (
                <span className="font-mono text-[9px] text-dim flex items-center gap-0.5">
                  <Calendar size={8} /> {formatDate(todo.dueDate)}
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
          <input autoFocus required
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Uppgift…"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          />
          <div className="flex gap-2 flex-wrap">
            <select className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="hög">Hög prioritet</option>
              <option value="medel">Medel</option>
              <option value="låg">Låg</option>
            </select>
            <input type="date"
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
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
  const [showForm,     setShowForm]     = useState(false)
  const [form,         setForm]         = useState({ text: '', targetDate: '' })
  const [editingId,    setEditingId]    = useState(null)
  const [editProgress, setEditProgress] = useState(0)

  function handleAdd(e) {
    e.preventDefault()
    store.addOrgGoal(org.id, form)
    setForm({ text: '', targetDate: '' })
    setShowForm(false)
  }

  const color = org.color ?? ACCENT

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
                  <Calendar size={9} /> {formatDate(goal.targetDate)}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {editingId === goal.id ? (
                  <>
                    <input type="range" min={0} max={100} step={5} value={editProgress}
                      onChange={e => setEditProgress(Number(e.target.value))}
                      className="flex-1 accent-rose" />
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
                        style={{ width: `${goal.progress ?? 0}%`, backgroundColor: goal.done ? '#34d399' : color }} />
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
          <input autoFocus required
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Mål…"
            value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          <div className="flex gap-2">
            <input type="date"
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none"
              value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
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

// ─── Kontakter ────────────────────────────────────────────────────────────────

function OrgKontakter({ org, contacts, store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '' })
  const color = org.color ?? ACCENT

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    store.addContact(org.id, form)
    setForm({ name: '', role: '', email: '', phone: '' })
    setShowForm(false)
  }

  const f = key => v => setForm(p => ({ ...p, [key]: v }))

  const initials = name => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-1.5">
      {contacts.length === 0 && !showForm && (
        <p className="font-mono text-[11px] text-dim mb-2">// Inga kontakter ännu</p>
      )}

      {contacts.map(c => (
        <div key={c.id} className="group flex items-center gap-3 rounded-lg border border-border bg-surface2 px-3 py-2.5">
          <div
            className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center font-mono text-[10px] font-medium"
            style={{ backgroundColor: color + '1a', color }}
          >
            {initials(c.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[12px] font-medium text-text">{c.name}</p>
            {c.role && <p className="font-mono text-[10px] text-muted">{c.role}</p>}
            <div className="flex gap-3 mt-0.5 flex-wrap">
              {c.email && (
                <a href={`mailto:${c.email}`} className="font-mono text-[10px] text-dim hover:text-accent transition-colors">
                  {c.email}
                </a>
              )}
              {c.phone && <span className="font-mono text-[10px] text-dim">{c.phone}</span>}
            </div>
          </div>
          <button
            onClick={() => store.removeContact(c.id)}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:text-rose transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-lg border border-border bg-surface2 p-3 space-y-2 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Namn" value={form.name} onChange={f('name')} required placeholder="Anna Svensson" />
            <Field label="Roll (valfritt)" value={form.role} onChange={f('role')} placeholder="Ordförande" />
            <Field label="E-post (valfritt)" value={form.email} onChange={f('email')} placeholder="anna@…" type="email" />
            <Field label="Telefon (valfritt)" value={form.phone} onChange={f('phone')} placeholder="+46 70…" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-[11px] py-1">Lägg till</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-[11px] py-1">Avbryt</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors mt-1"
        >
          <UserPlus size={11} /> Lägg till kontakt
        </button>
      )}
    </div>
  )
}

// ─── Aktivitetslogg ───────────────────────────────────────────────────────────

function OrgLogg({ org, logs, store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text: '', date: today() })
  const color = org.color ?? ACCENT

  function handleAdd(e) {
    e.preventDefault()
    if (!form.text.trim()) return
    store.addOrgLog(org.id, form)
    setForm({ text: '', date: today() })
    setShowForm(false)
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      {sorted.length === 0 && !showForm && (
        <p className="font-mono text-[11px] text-dim mb-3">
          // Dokumentera möten, beslut och viktiga händelser
        </p>
      )}

      <div className="mb-3">
        {sorted.map((entry, i) => (
          <div key={entry.id} className="group flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {i < sorted.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="pb-3 flex-1 min-w-0">
              <p className="font-mono text-[12px] text-text leading-snug">{entry.text}</p>
              <p className="mt-0.5 font-mono text-[10px] text-dim">{formatDate(entry.date)}</p>
            </div>
            <button
              onClick={() => store.removeOrgLog(entry.id)}
              className="mt-0.5 self-start opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:text-rose transition-all"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleAdd} className="rounded-lg border border-border bg-surface2 p-3 space-y-2">
          <textarea
            autoFocus
            required
            rows={2}
            className="w-full resize-none rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Vad hände? T.ex. 'Styrelsemöte — röstade om budget'"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          />
          <div className="flex gap-2 flex-wrap">
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text outline-none" />
            <button type="submit" className="btn-primary py-1 px-2 text-[11px]">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost py-1 px-2 text-[11px]">Avbryt</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
        >
          <Plus size={11} /> Ny loggpost
        </button>
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

const EMPTY_PLATFORM = { name: '', url: '', goal: '', color: '#7c72f5', notes: '' }

function PlatformsTab({ store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_PLATFORM)

  function handleAdd(e) {
    e.preventDefault()
    store.addPlatform(form)
    setForm(EMPTY_PLATFORM)
    setShowForm(false)
  }

  const f = key => v => setForm(p => ({ ...p, [key]: v }))

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Ny plattform
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 space-y-3 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Ny plattform</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-text"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Namn" value={form.name} onChange={f('name')} required />
            <Field label="URL (valfritt)" value={form.url} onChange={f('url')} placeholder="https://…" />
            <Field label="Syfte (valfritt)" value={form.goal} onChange={f('goal')} placeholder="Vad vill du uppnå?" />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Accentfärg</label>
              <input type="color" className="h-9 w-full cursor-pointer rounded-lg border border-border bg-surface2"
                value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  const [editing,    setEditing]    = useState(false)
  const [form,       setForm]       = useState({ name: p.name, url: p.url ?? '', goal: p.goal ?? '', color: p.color ?? '#7c72f5', notes: p.notes ?? '' })
  const [confirmDel, setConfirmDel] = useState(false)

  function handleUpdate(e) {
    e.preventDefault()
    store.updatePlatform(p.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="rounded-xl border border-border bg-surface p-4 space-y-2">
        <Field label="Namn"          value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  required />
        <Field label="URL"           value={form.url}   onChange={v => setForm(f => ({ ...f, url: v }))}   placeholder="https://…" />
        <Field label="Syfte"         value={form.goal}  onChange={v => setForm(f => ({ ...f, goal: v }))} />
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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-border2">
      {/* Färgad topplinje */}
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: p.color }} />

      <div className="flex flex-1 flex-col p-4">
        {/* Kortets rubrik */}
        <div className="mb-3 flex items-start justify-between gap-2">
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

        {/* Aktivitetssektion */}
        <AktivitetSection platform={p} store={store} />
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

// ─── Aktivitetssektion (ersätter daglig check-in) ─────────────────────────────

function AktivitetSection({ platform, store }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', date: today(), url: '' })

  const activities = [...(platform.activities ?? [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const lastDate = activities[0]?.date ?? null
  const days     = daysSince(lastDate)
  const dotColor = lastActiveColor(days)

  function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    store.addPlatformActivity(platform.id, form)
    setForm({ title: '', date: today(), url: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Senast aktiv */}
      <div className="mb-2 flex items-center gap-1.5">
        <History size={11} style={{ color: dotColor }} />
        <span className="font-mono text-[10px]" style={{ color: dotColor }}>
          {lastDate ? `Senast aktiv ${formatRelative(lastDate)}` : 'Ingen aktivitet loggad'}
        </span>
      </div>

      {/* Aktivitetslista */}
      {activities.length === 0 && !showForm && (
        <p className="mb-2 font-mono text-[10px] text-dim">// Logga vad du skapat eller bidragit med</p>
      )}
      <div className="mb-2 flex-1 space-y-1">
        {activities.slice(0, 5).map(act => (
          <div key={act.id} className="group/act flex items-center gap-2">
            <span className="w-12 shrink-0 font-mono text-[9px] text-dim tabular-nums">
              {formatShortDate(act.date)}
            </span>
            <span className="flex-1 truncate font-mono text-[11px] text-text">{act.title}</span>
            {act.url && (
              <a href={act.url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="shrink-0 text-dim hover:text-accent transition-colors">
                <ExternalLink size={10} />
              </a>
            )}
            <button
              onClick={() => store.removePlatformActivity(platform.id, act.id)}
              className="shrink-0 text-dim opacity-0 group-hover/act:opacity-100 hover:text-rose transition-all"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        {activities.length > 5 && (
          <p className="font-mono text-[10px] text-dim">+{activities.length - 5} till</p>
        )}
      </div>

      {/* Lägg till-formulär */}
      {showForm ? (
        <form onSubmit={handleAdd} className="space-y-1.5 rounded-lg border border-border bg-surface2 p-2.5">
          <input
            autoFocus
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px] text-text placeholder-dim outline-none focus:border-accent/40"
            placeholder="Vad skapade du?"
          />
          <div className="flex gap-1.5">
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="flex-1 rounded border border-border bg-surface px-2 py-1 font-mono text-[10px] text-text outline-none" />
            <input value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="flex-1 rounded border border-border bg-surface px-2 py-1 font-mono text-[10px] text-text placeholder-dim outline-none"
              placeholder="URL (valfritt)" />
          </div>
          <div className="flex gap-1.5">
            <button type="submit" className="btn-primary text-[10px] py-0.5 px-2">Spara</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-[10px] py-0.5 px-2">Avbryt</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 font-mono text-[11px] text-muted hover:bg-surface2 hover:text-text transition-all"
        >
          <Plus size={11} /> Logga aktivitet
        </button>
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
