import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Globe, Github, ArrowRight,
  CheckCircle2, Circle, GitBranch, Layers,
  Activity, AlertCircle,
} from 'lucide-react'
import { useProjectStore } from '@/store'
import { useFadeIn, useStaggerIn } from '@/hooks/useGSAP'

const STATUS_COLORS = {
  active: { bg: '#05966912', text: '#059669', dot: '#059669', label: 'active' },
  paused: { bg: '#d9770612', text: '#d97706', dot: '#d97706', label: 'paused' },
  done:   { bg: '#8080a012', text: '#8080a0', dot: '#8080a0', label: 'done'   },
}

const DEPLOY_META = {
  success:  { color: '#059669', label: 'success',  pulse: false },
  building: { color: '#d97706', label: 'building…', pulse: true  },
  failed:   { color: '#e11d48', label: 'failed',    pulse: false },
  unknown:  { color: '#8080a0', label: 'unknown',   pulse: false },
}

export default function ProjectsView() {
  const ref     = useFadeIn()
  const gridRef = useStaggerIn(0.04)
  const navigate = useNavigate()
  const { projects, todos, addProject } = useProjectStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', liveUrl: '', repoUrl: '',
    platform: 'Vercel', framework: 'Next.js', status: 'active',
  })

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const item = addProject({ ...form, deployStatus: 'unknown', techStack: [] })
    setForm({ name: '', description: '', liveUrl: '', repoUrl: '', platform: 'Vercel', framework: 'Next.js', status: 'active' })
    setShowForm(false)
    navigate(`/projekt/${item.id}`)
  }

  // Aggregerade stats
  const active       = projects.filter(p => p.status === 'active').length
  const totalTodos   = todos.length
  const doneTodos    = todos.filter(t => t.status === 'done').length
  const openTodos    = todos.filter(t => t.status !== 'done').length
  const deployOk     = projects.filter(p => p.deployStatus === 'success').length

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-text">Projekt</h1>
        <p className="mt-1 font-mono text-xs text-muted">
          {projects.length} projekt · {active} aktiva
        </p>
      </div>

      {/* ── Stats-bar ── */}
      <div className="mb-7 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCell label="Aktiva projekt"  value={active}     icon={Layers}       />
        <StatCell label="Öppna uppgifter" value={openTodos}  icon={Circle}       accent="#e11d48" />
        <StatCell label="Klara uppgifter" value={doneTodos}  icon={CheckCircle2} accent="#059669" />
        <StatCell label="Deploy: success" value={deployOk}   icon={Activity}     accent="#7c72f5" />
      </div>

      {/* ── Ny projekt-knapp ── */}
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
          — {projects.length} repositories
        </p>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5">
          <Plus size={13} /> Nytt projekt
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-3">
          <p className="font-display text-sm font-semibold text-text">Initiera projekt</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="namn" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Field label="beskrivning" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <Select label="status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))}
              options={[{ v: 'active', l: 'active' }, { v: 'paused', l: 'paused' }, { v: 'done', l: 'done' }]} />
            <Select label="framework" value={form.framework} onChange={v => setForm(f => ({ ...f, framework: v }))}
              options={['Next.js','Docusaurus','React','Astro','SvelteKit','Annat'].map(x => ({ v: x, l: x }))} />
            <Select label="plattform" value={form.platform} onChange={v => setForm(f => ({ ...f, platform: v }))}
              options={['Vercel','Netlify','GitHub Pages','Railway','Annat'].map(x => ({ v: x, l: x }))} />
            <Field label="live-url" value={form.liveUrl} onChange={v => setForm(f => ({ ...f, liveUrl: v }))} placeholder="https://…" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Skapa</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      {/* ── Project grid ── */}
      <div ref={gridRef} className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {projects.map(project => {
          const pt = todos.filter(t => t.projectId === project.id)
          return (
            <ProjectCard
              key={project.id}
              project={project}
              todos={pt}
              onClick={() => navigate(`/projekt/${project.id}`)}
            />
          )
        })}
        {projects.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-20 text-center">
            <p className="font-mono text-xs text-muted">// inga projekt ännu</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project, todos, onClick }) {
  const status  = STATUS_COLORS[project.status] ?? STATUS_COLORS.active
  const deploy  = DEPLOY_META[project.deployStatus] ?? DEPLOY_META.unknown
  const done    = todos.filter(t => t.status === 'done').length
  const open    = todos.filter(t => t.status !== 'done').length
  const pct     = todos.length > 0 ? Math.round((done / todos.length) * 100) : null

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl border border-border bg-surface transition-all duration-150 hover:border-accent/30 hover:shadow-sm overflow-hidden"
    >
      {/* Accent left bar */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 transition-all duration-150 group-hover:w-1"
        style={{ backgroundColor: status.dot }}
      />

      <div className="px-4 py-4 pl-5">

        {/* Top: name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-bold leading-tight text-text truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-0.5 truncate font-sans text-xs text-muted">{project.description}</p>
            )}
          </div>
          <span
            className="shrink-0 rounded font-mono text-[10px] px-1.5 py-0.5"
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            {status.label}
          </span>
        </div>

        {/* Meta: framework · platform · branch */}
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-muted">
          <span>{project.framework}</span>
          <span className="text-dim">·</span>
          <span>{project.platform}</span>
          {project.deployBranch && (
            <>
              <span className="text-dim">·</span>
              <span className="flex items-center gap-0.5">
                <GitBranch size={10} />
                {project.deployBranch}
              </span>
            </>
          )}
        </div>

        {/* Deploy status */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={['h-1.5 w-1.5 rounded-full', deploy.pulse ? 'pulse-dot' : ''].join(' ')}
            style={{ backgroundColor: deploy.color }}
          />
          <span className="font-mono text-[11px]" style={{ color: deploy.color }}>
            deploy: {deploy.label}
          </span>
        </div>

        {/* Tech stack pills */}
        {project.techStack?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.techStack.slice(0, 5).map(tag => (
              <span
                key={tag}
                className="rounded border border-border font-mono text-[10px] px-1.5 py-px text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Todo progress */}
        {todos.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-muted">
                {open > 0
                  ? <><span className="text-amber">{open}</span> open · <span className="text-green">{done}</span> closed</>
                  : <span className="text-green">all {done} closed</span>
                }
              </span>
              <span className="font-mono text-[10px] text-muted">{pct}%</span>
            </div>
            <div className="h-px w-full bg-border">
              <div
                className="h-px bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom: links + arrow */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-3" onClick={e => e.stopPropagation()}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-[10px] text-muted hover:text-text transition-colors">
                <Globe size={10} /> live
              </a>
            )}
            {project.repoUrl && (
              <a href={`https://${project.repoUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-[10px] text-muted hover:text-text transition-colors">
                <Github size={10} /> repo
              </a>
            )}
          </div>
          <ArrowRight size={13} className="text-dim transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

      </div>
    </div>
  )
}

// ─── StatCell ────────────────────────────────────────────────────────────────

function StatCell({ label, value, icon: Icon, accent = '#7c72f5' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: accent + '12', color: accent }}
      >
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-mono text-xl font-medium leading-none text-text">{value}</p>
        <p className="mt-0.5 text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
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
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
