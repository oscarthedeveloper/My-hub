import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, Github, Globe, Figma,
  Plus, Trash2, CheckCircle2, Circle, Clock,
  Lightbulb, MessageSquare, HelpCircle, Link2,
  ChevronDown, GitBranch, Terminal,
  Package, Cpu, RefreshCw, AlertTriangle,
  GitCommit, Timer,
} from 'lucide-react'
import { useProjectStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'
import { refreshDeploy, getToken, setToken, hasToken, listNetlifySites } from '@/lib/deployApi'

// ─── Konstanter ───────────────────────────────────────────────────────────────

const PRIORITIES = [
  { id: 'high',   label: 'high',   color: '#e11d48' },
  { id: 'medium', label: 'medium', color: '#d97706' },
  { id: 'low',    label: 'low',    color: '#059669' },
]

const CATEGORIES = [
  { id: 'feature',  label: 'feat',     color: '#7c72f5' },
  { id: 'bug',      label: 'fix',      color: '#e11d48' },
  { id: 'refactor', label: 'refactor', color: '#0891b2' },
  { id: 'design',   label: 'design',   color: '#d97706' },
  { id: 'content',  label: 'content',  color: '#059669' },
  { id: 'docs',     label: 'docs',     color: '#8080a0' },
]

const IDEA_TYPES = [
  { id: 'idea',      label: 'idea',      icon: Lightbulb,     color: '#d97706' },
  { id: 'question',  label: 'question',  icon: HelpCircle,    color: '#0891b2' },
  { id: 'feedback',  label: 'feedback',  icon: MessageSquare, color: '#7c72f5' },
  { id: 'reference', label: 'ref',       icon: Link2,         color: '#059669' },
]

const DEPLOY_META = {
  success:  { color: '#059669', label: 'success',  pulse: false },
  building: { color: '#d97706', label: 'building…', pulse: true  },
  failed:   { color: '#e11d48', label: 'failed',    pulse: false },
  unknown:  { color: '#8080a0', label: 'unknown',   pulse: false },
}

const STATUS_COLORS = {
  active: { bg: '#05966912', text: '#059669', label: 'active' },
  paused: { bg: '#d9770612', text: '#d97706', label: 'paused' },
  done:   { bg: '#8080a012', text: '#8080a0', label: 'done'   },
}

// ─── Huvud-komponent ──────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ref = useFadeIn()

  const { projects, updateProject, todos, addTodo, updateTodo, removeTodo, ideas, addIdea, removeIdea } =
    useProjectStore()

  const project = projects.find(p => p.id === id)

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="font-mono text-sm text-muted">// project not found</p>
      </div>
    )
  }

  const projectTodos = todos.filter(t => t.projectId === id)
  const projectIdeas = ideas.filter(i => i.projectId === id)
  const deploy       = DEPLOY_META[project.deployStatus] ?? DEPLOY_META.unknown
  const status       = STATUS_COLORS[project.status] ?? STATUS_COLORS.active
  const doneCount    = projectTodos.filter(t => t.status === 'done').length
  const openCount    = projectTodos.filter(t => t.status !== 'done').length
  const donePct      = projectTodos.length > 0 ? Math.round((doneCount / projectTodos.length) * 100) : 0

  return (
    <div ref={ref} className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface px-8 py-6">
        <button
          onClick={() => navigate('/projekt')}
          className="mb-4 flex items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={12} /> cd ../projekt
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Project name in Syne */}
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-bold tracking-tight text-text">
                {project.name}
              </h1>
              <span
                className="rounded font-mono text-[11px] px-2 py-0.5"
                style={{ backgroundColor: status.bg, color: status.text }}
              >
                {status.label}
              </span>
            </div>
            {project.description && (
              <p className="mt-1.5 max-w-2xl font-sans text-sm text-muted">
                {project.description}
              </p>
            )}

            {/* Terminal-style meta line */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
              {project.framework && <span className="flex items-center gap-1"><Cpu size={10} /> {project.framework}</span>}
              {project.platform  && <span className="flex items-center gap-1"><Package size={10} /> {project.platform}</span>}
              {project.deployBranch && <span className="flex items-center gap-1"><GitBranch size={10} /> {project.deployBranch}</span>}
              {project.nodeVersion  && <span>node {project.nodeVersion}</span>}
              <span className="flex items-center gap-1.5">
                <span
                  className={['h-1.5 w-1.5 rounded-full', deploy.pulse ? 'pulse-dot' : ''].join(' ')}
                  style={{ backgroundColor: deploy.color }}
                />
                <span style={{ color: deploy.color }}>deploy: {deploy.label}</span>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-2 shrink-0">
            {project.liveUrl   && <QuickLink href={project.liveUrl}   icon={Globe}         label="live site"       />}
            {project.repoUrl   && <QuickLink href={`https://${project.repoUrl.replace(/^https?:\/\//, '')}`} icon={Github} label="repository" />}
            {project.deployUrl && <QuickLink href={project.deployUrl} icon={ExternalLink}  label="deploy dashboard" />}
            {project.figmaUrl  && <QuickLink href={project.figmaUrl}  icon={Figma}         label="figma"           />}
          </div>
        </div>

        {/* Tech stack */}
        {project.techStack?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map(tag => (
              <span
                key={tag}
                className="rounded border border-border font-mono text-[10px] px-2 py-px text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {projectTodos.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] text-muted">
                <span style={{ color: '#e11d48' }}>{openCount}</span> open ·{' '}
                <span style={{ color: '#059669' }}>{doneCount}</span> closed
              </span>
              <span className="font-mono text-[11px] text-muted">{donePct}% complete</span>
            </div>
            <div className="h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-accent transition-all duration-500"
                style={{ width: `${donePct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="p-4 md:p-8">

        {/* Project vitals terminal panel */}
        <ProjectVitals project={project} onUpdate={patch => updateProject(id, patch)} />

        {/* Deploy status panel */}
        <DeployPanel project={project} onUpdate={patch => updateProject(id, patch)} />

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-5">

          {/* Todos — 3 col */}
          <div className="col-span-1 md:col-span-3">
            <TodoSection
              todos={projectTodos}
              onAdd={todo => addTodo(id, todo)}
              onUpdate={updateTodo}
              onRemove={removeTodo}
            />
          </div>

          {/* Ideas — 2 col */}
          <div className="col-span-1 md:col-span-2">
            <IdeasSection
              ideas={projectIdeas}
              onAdd={idea => addIdea(id, idea)}
              onRemove={removeIdea}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ProjectVitals ────────────────────────────────────────────────────────────

function ProjectVitals({ project, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name:          project.name ?? '',
    description:   project.description ?? '',
    framework:     project.framework ?? 'Next.js',
    platform:      project.platform ?? 'Vercel',
    status:        project.status ?? 'active',
    liveUrl:       project.liveUrl ?? '',
    repoUrl:       project.repoUrl ?? '',
    deployUrl:     project.deployUrl ?? '',
    figmaUrl:      project.figmaUrl ?? '',
    deployStatus:  project.deployStatus ?? 'unknown',
    deployBranch:  project.deployBranch ?? 'main',
    lastDeployAt:  project.lastDeployAt ?? '',
    techStack:     (project.techStack ?? []).join(', '),
    nodeVersion:   project.nodeVersion ?? '',
    notes:         project.notes ?? '',
  })

  function handleSave(e) {
    e.preventDefault()
    onUpdate({
      ...form,
      techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean),
    })
    setOpen(false)
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">

      {/* Terminal header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-muted" />
          <span className="font-mono text-[11px] text-muted">project.config</span>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 font-mono text-[11px] text-muted transition-colors hover:text-text"
        >
          {open ? 'close' : 'edit'}
          <ChevronDown
            size={12}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          />
        </button>
      </div>

      {/* Read-only display (when closed) */}
      {!open && (
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          <VitalCell k="name"        v={project.name} />
          <VitalCell k="live"        v={project.liveUrl} href={project.liveUrl} />
          <VitalCell k="repo"        v={project.repoUrl ? project.repoUrl.replace(/^https?:\/\//, '') : undefined} href={project.repoUrl ? `https://${project.repoUrl.replace(/^https?:\/\//, '')}` : undefined} />
          <VitalCell k="last deploy" v={project.lastDeployAt ? new Date(project.lastDeployAt).toLocaleDateString('sv-SE') : undefined} />
        </div>
      )}

      {/* Edit form (when open) */}
      {open && (
        <form onSubmit={handleSave} className="px-5 pb-5 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <VField k="name"           v={form.name}          set={v => setForm(f => ({ ...f, name: v }))}          req />
            <VField k="description"    v={form.description}   set={v => setForm(f => ({ ...f, description: v }))}   />
            <VSelect k="status"        v={form.status}        set={v => setForm(f => ({ ...f, status: v }))}
              opts={[{ v: 'active', l: 'active' }, { v: 'paused', l: 'paused' }, { v: 'done', l: 'done' }]} />

            <VSelect k="framework"     v={form.framework}     set={v => setForm(f => ({ ...f, framework: v }))}
              opts={['Next.js','Docusaurus','React','Astro','SvelteKit','Annat'].map(x => ({ v: x, l: x }))} />
            <VSelect k="platform"      v={form.platform}      set={v => setForm(f => ({ ...f, platform: v }))}
              opts={['Vercel','Netlify','GitHub Pages','Railway','Annat'].map(x => ({ v: x, l: x }))} />
            <VSelect k="deploy_status" v={form.deployStatus}  set={v => setForm(f => ({ ...f, deployStatus: v }))}
              opts={['success','building','failed','unknown'].map(x => ({ v: x, l: x }))} />

            <VField k="live_url"       v={form.liveUrl}       set={v => setForm(f => ({ ...f, liveUrl: v }))}       ph="https://…" />
            <VField k="repo_url"       v={form.repoUrl}       set={v => setForm(f => ({ ...f, repoUrl: v }))}       ph="github.com/user/repo" />
            <VField k="deploy_url"     v={form.deployUrl}     set={v => setForm(f => ({ ...f, deployUrl: v }))}     ph="vercel.com/…" />

            <VField k="figma_url"      v={form.figmaUrl}      set={v => setForm(f => ({ ...f, figmaUrl: v }))}      ph="figma.com/…" />
            <VField k="branch"         v={form.deployBranch}  set={v => setForm(f => ({ ...f, deployBranch: v }))}  ph="main" />
            <VField k="node_version"   v={form.nodeVersion}   set={v => setForm(f => ({ ...f, nodeVersion: v }))}   ph="20.x" />

            <div className="col-span-2">
              <VField k="tech_stack"   v={form.techStack}     set={v => setForm(f => ({ ...f, techStack: v }))}     ph="TypeScript, Tailwind, Prisma, …" />
            </div>
            <div className="col-span-3">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">notes</label>
              <textarea
                className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40 font-mono text-xs"
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="// free-form notes about this project"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function VitalCell({ k, v, href }) {
  return (
    <div className="px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{k}</p>
      {v ? (
        href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="mt-0.5 block truncate font-mono text-xs text-accent hover:underline">
            {v}
          </a>
        ) : (
          <p className="mt-0.5 truncate font-mono text-xs text-text">{v}</p>
        )
      ) : (
        <p className="mt-0.5 font-mono text-xs text-dim">—</p>
      )}
    </div>
  )
}

// ─── DeployPanel ─────────────────────────────────────────────────────────────

function DeployPanel({ project, onUpdate }) {
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [lastDeploy, setLastDeploy] = useState(project.lastDeployData ?? null)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [showSiteForm, setShowSiteForm]   = useState(false)
  const [tokenInput, setTokenInput]       = useState('')
  const [siteIdInput, setSiteIdInput]     = useState(project.siteId ?? project.projectSlug ?? '')
  const [sites, setSites]                 = useState([])
  const [loadingSites, setLoadingSites]   = useState(false)

  const platform = (project.platform ?? '').toLowerCase()
  const supported = platform === 'netlify' || platform === 'vercel'
  const tokenOk   = hasToken(platform)

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    try {
      const deploy = await refreshDeploy(project)
      setLastDeploy(deploy)
      onUpdate({
        deployStatus:   deploy.status,
        lastDeployAt:   deploy.createdAt,
        deployBranch:   deploy.branch ?? project.deployBranch,
        lastDeployData: deploy,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadSites() {
    setLoadingSites(true)
    try {
      const list = await listNetlifySites()
      setSites(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingSites(false)
    }
  }

  function saveToken() {
    setToken(platform, tokenInput)
    setTokenInput('')
    setShowTokenForm(false)
  }

  function saveSiteId() {
    const key = platform === 'netlify' ? 'siteId' : 'projectSlug'
    onUpdate({ [key]: siteIdInput })
    setShowSiteForm(false)
  }

  if (!supported) return null

  const deploy = DEPLOY_META[project.deployStatus] ?? DEPLOY_META.unknown

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={['h-2 w-2 rounded-full', deploy.pulse ? 'pulse-dot' : ''].join(' ')}
            style={{ backgroundColor: deploy.color }}
          />
          <span className="font-mono text-[11px] text-muted">
            {project.platform} · deploy status
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !tokenOk}
          className="flex items-center gap-1 font-mono text-[11px] text-muted transition-colors hover:text-text disabled:opacity-40"
          title={!tokenOk ? `Lägg till ${project.platform}-token först` : 'Hämta senaste deploy'}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'fetching…' : 'refresh'}
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose/20 bg-rose/5 px-3 py-2">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-rose" />
            <p className="font-mono text-[11px] text-rose">{error}</p>
          </div>
        )}

        {/* Token saknas */}
        {!tokenOk && (
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-amber">
              ⚠ {project.platform}-token saknas
            </p>
            {!showTokenForm ? (
              <button
                onClick={() => setShowTokenForm(true)}
                className="font-mono text-[11px] text-accent hover:underline"
              >
                + Lägg till token
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-xs text-text outline-none focus:border-accent/40"
                  placeholder={`${project.platform} personal access token…`}
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveToken()}
                  autoFocus
                />
                <button onClick={saveToken} className="btn-primary text-xs">Spara</button>
                <button onClick={() => setShowTokenForm(false)} className="btn-ghost text-xs">Avbryt</button>
              </div>
            )}
          </div>
        )}

        {/* Site ID saknas */}
        {tokenOk && !project.siteId && !project.projectSlug && (
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-amber">
              ⚠ {platform === 'netlify' ? 'site_id' : 'project slug'} saknas
            </p>

            {platform === 'netlify' && (
              <button
                onClick={handleLoadSites}
                disabled={loadingSites}
                className="font-mono text-[11px] text-accent hover:underline disabled:opacity-50"
              >
                {loadingSites ? 'Hämtar sajter…' : '→ Hämta mina Netlify-sajter'}
              </button>
            )}

            {/* Site-lista från Netlify */}
            {sites.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                {sites.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSiteIdInput(s.id); setShowSiteForm(true); setSites([]) }}
                    className="flex w-full items-center justify-between border-b border-border px-3 py-2 font-mono text-[11px] text-muted last:border-0 hover:bg-surface2 hover:text-text transition-colors"
                  >
                    <span>{s.name}</span>
                    <span className="text-dim">{s.id}</span>
                  </button>
                ))}
              </div>
            )}

            {!showSiteForm && !sites.length && (
              <button
                onClick={() => setShowSiteForm(true)}
                className="font-mono text-[11px] text-accent hover:underline"
              >
                + Ange {platform === 'netlify' ? 'site_id' : 'project slug'} manuellt
              </button>
            )}

            {showSiteForm && (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-xs text-text outline-none focus:border-accent/40"
                  placeholder={platform === 'netlify' ? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : 'my-project-name'}
                  value={siteIdInput}
                  onChange={e => setSiteIdInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveSiteId()}
                  autoFocus
                />
                <button onClick={saveSiteId} className="btn-primary text-xs">Spara</button>
                <button onClick={() => setShowSiteForm(false)} className="btn-ghost text-xs">Avbryt</button>
              </div>
            )}
          </div>
        )}

        {/* Deploy-data */}
        {(project.siteId || project.projectSlug) && tokenOk && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DeployCell k="status"   v={<span style={{ color: deploy.color }}>{deploy.label}</span>} />
            <DeployCell k="branch"   v={project.deployBranch ?? lastDeploy?.branch ?? '—'} />
            <DeployCell k="commit"   v={lastDeploy?.commitRef ?? '—'} />
            <DeployCell k="deployed" v={project.lastDeployAt
              ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(project.lastDeployAt))
              : '—'
            } />
          </div>
        )}

        {lastDeploy?.title && (
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <GitCommit size={11} />
            {lastDeploy.title}
          </p>
        )}

        {lastDeploy?.duration && (
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
            <Timer size={10} /> build time: {lastDeploy.duration}
          </p>
        )}

        {lastDeploy?.errorMessage && (
          <p className="font-mono text-[11px] text-rose">{lastDeploy.errorMessage}</p>
        )}

        {/* Token-hantering (när token redan finns) */}
        {tokenOk && (
          <div className="flex items-center gap-3 pt-1">
            <span className="font-mono text-[10px] text-dim">
              ✓ {project.platform} token aktiv
            </span>
            <button
              onClick={() => setShowTokenForm(s => !s)}
              className="font-mono text-[10px] text-dim hover:text-muted transition-colors"
            >
              Byt token
            </button>
            {showTokenForm && (
              <div className="flex gap-2 flex-1">
                <input
                  type="password"
                  className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-1 font-mono text-xs text-text outline-none focus:border-accent/40"
                  placeholder="Ny token…"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveToken()}
                  autoFocus
                />
                <button onClick={saveToken} className="btn-primary text-xs">Spara</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DeployCell({ k, v }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-dim">{k}</p>
      <p className="mt-0.5 font-mono text-xs text-text">{v}</p>
    </div>
  )
}

// ─── TodoSection ──────────────────────────────────────────────────────────────

function TodoSection({ todos, onAdd, onUpdate, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('open')
  const [form, setForm] = useState({ title: '', priority: 'medium', category: 'feature', notes: '' })

  function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd(form)
    setForm({ title: '', priority: 'medium', category: 'feature', notes: '' })
    setShowForm(false)
  }

  function cycleStatus(todo) {
    const cycle = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' }
    onUpdate(todo.id, {
      status: cycle[todo.status],
      completedAt: cycle[todo.status] === 'done' ? new Date().toISOString() : null,
    })
  }

  const filtered = filter === 'open'
    ? todos.filter(t => t.status !== 'done')
    : filter === 'done'
    ? todos.filter(t => t.status === 'done')
    : todos

  const openC = todos.filter(t => t.status !== 'done').length
  const doneC = todos.filter(t => t.status === 'done').length

  return (
    <div>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="font-display text-base font-bold text-text">Issues</h2>
          <div className="ml-2 flex gap-0.5">
            {[
              { k: 'open', label: `${openC} open` },
              { k: 'done', label: `${doneC} closed` },
              { k: 'all',  label: 'all' },
            ].map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={[
                  'rounded px-2 py-0.5 font-mono text-[11px] transition-all',
                  filter === f.k ? 'bg-surface2 text-text ring-1 ring-border' : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1">
          <Plus size={12} /> New issue
        </button>
      </div>

      {/* New issue form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-3 rounded-xl border border-accent/30 bg-surface p-4 space-y-3">
          <VField k="title" v={form.title} set={v => setForm(f => ({ ...f, title: v }))} req />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p.id }))}
                    className="rounded px-2 py-1 font-mono text-[11px] transition-all"
                    style={form.priority === p.id
                      ? { backgroundColor: p.color + '20', color: p.color, outline: `1px solid ${p.color}40` }
                      : { color: '#8080a0' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">label</label>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => setForm(f => ({ ...f, category: c.id }))}
                    className="rounded px-2 py-0.5 font-mono text-[10px] transition-all"
                    style={form.category === c.id
                      ? { backgroundColor: c.color + '20', color: c.color, outline: `1px solid ${c.color}40` }
                      : { color: '#8080a0' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <VField k="notes (optional)" v={form.notes} set={v => setForm(f => ({ ...f, notes: v }))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Issues list */}
      <div className="rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-mono text-xs text-muted">
              {filter === 'open' ? '// no open issues' : '// nothing here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered
              .sort((a, b) => {
                const p = { high: 0, medium: 1, low: 2 }
                const s = { 'in-progress': 0, todo: 1, done: 2 }
                return s[a.status] - s[b.status] || p[a.priority] - p[b.priority]
              })
              .map(todo => (
                <IssueRow
                  key={todo.id}
                  todo={todo}
                  onCycle={() => cycleStatus(todo)}
                  onRemove={() => onRemove(todo.id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IssueRow({ todo, onCycle, onRemove }) {
  const prio = PRIORITIES.find(p => p.id === todo.priority) ?? PRIORITIES[1]
  const cat  = CATEGORIES.find(c => c.id === todo.category) ?? CATEGORIES[0]

  const statusIcon = todo.status === 'done'
    ? <CheckCircle2 size={15} style={{ color: '#059669' }} />
    : todo.status === 'in-progress'
    ? <Clock size={15} style={{ color: '#d97706' }} />
    : <Circle size={15} style={{ color: '#8080a0' }} />

  return (
    <div className={[
      'group flex items-start gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface2',
      todo.status === 'done' ? 'opacity-55' : '',
    ].join(' ')}>
      <button onClick={onCycle} className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity">
        {statusIcon}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={['font-sans text-sm text-text', todo.status === 'done' ? 'line-through' : ''].join(' ')}
          >
            {todo.title}
          </span>
          <span
            className="rounded px-1.5 py-px font-mono text-[10px]"
            style={{ backgroundColor: cat.color + '18', color: cat.color }}
          >
            {cat.label}
          </span>
          <span className="font-mono text-[10px]" style={{ color: prio.color }}>
            {prio.label}
          </span>
        </div>
        {todo.notes && (
          <p className="mt-0.5 font-sans text-xs text-muted">{todo.notes}</p>
        )}
        {todo.completedAt && (
          <p className="mt-0.5 font-mono text-[10px] text-dim">
            closed {new Date(todo.completedAt).toLocaleDateString('sv-SE')}
          </p>
        )}
      </div>

      <button
        onClick={onRemove}
        className="shrink-0 text-dim opacity-0 transition-all hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

// ─── IdeasSection ─────────────────────────────────────────────────────────────

function IdeasSection({ ideas, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ content: '', type: 'idea' })

  function handleAdd(e) {
    e.preventDefault()
    if (!form.content.trim()) return
    onAdd(form)
    setForm({ content: '', type: 'idea' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-text">Notes</h2>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-3 rounded-xl border border-accent/30 bg-surface p-4 space-y-3">
          <div className="flex flex-wrap gap-1">
            {IDEA_TYPES.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  className="flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] transition-all"
                  style={form.type === t.id
                    ? { backgroundColor: t.color + '20', color: t.color, outline: `1px solid ${t.color}40` }
                    : { color: '#8080a0' }}>
                  <Icon size={10} /> {t.label}
                </button>
              )
            })}
          </div>
          <div>
            <textarea
              className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40"
              rows={3}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your note…"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {[...ideas].reverse().map(idea => {
          const type = IDEA_TYPES.find(t => t.id === idea.type) ?? IDEA_TYPES[0]
          const Icon = type.icon
          return (
            <div key={idea.id} className="group rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-start gap-2">
                <Icon size={13} className="mt-0.5 shrink-0" style={{ color: type.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-text">{idea.content}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-px font-mono text-[10px]"
                      style={{ backgroundColor: type.color + '15', color: type.color }}
                    >
                      {type.label}
                    </span>
                    <span className="font-mono text-[10px] text-dim">
                      {new Date(idea.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(idea.id)}
                  className="shrink-0 text-dim opacity-0 transition-all hover:text-rose group-hover:opacity-100"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )
        })}
        {ideas.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <p className="font-mono text-[11px] text-muted">// no notes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function QuickLink({ href, icon: Icon, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 font-mono text-[11px] text-muted transition-all hover:border-border2 hover:text-text">
      <Icon size={12} /> {label}
    </a>
  )
}

function VField({ k, v, set, req, ph }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{k}</label>
      <input
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-xs text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={v}
        onChange={e => set(e.target.value)}
        required={req}
        placeholder={ph}
      />
    </div>
  )
}

function VSelect({ k, v, set, opts }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{k}</label>
      <select
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent/40 transition-colors"
        value={v}
        onChange={e => set(e.target.value)}
      >
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
