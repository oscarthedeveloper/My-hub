import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code2, BookOpen, GraduationCap, Users,
  Globe, Activity, GitBranch, ArrowUpRight,
  Layers, Hash,
} from 'lucide-react'
import { useProjectStore, useLinguisticsStore, useHPStore, useEngagemangStore } from '@/store'
import { useStaggerIn } from '@/hooks/useGSAP'

// ─── Live clock ───────────────────────────────────────────────────────────────

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function pad(n) { return String(n).padStart(2, '0') }

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const gridRef = useStaggerIn(0.05)
  const navigate = useNavigate()
  const now = useClock()

  const { projects, todos } = useProjectStore()
  const { words, grammarEntries } = useLinguisticsStore()
  const { examDate, daysUntilExam } = useHPStore()
  const { organizations, platforms } = useEngagemangStore()

  const days            = daysUntilExam()
  const activeProjects  = projects.filter(p => p.status === 'active')
  const openTodos       = todos.filter(t => t.status !== 'done').length
  const successDeploys  = projects.filter(p => p.deployStatus === 'success').length

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const dateStr = now.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen p-4 md:p-8">

      {/* ── System status bar ── */}
      <div className="mb-6 flex items-center gap-0 rounded-xl border border-border bg-surface overflow-x-auto">
        {/* Online indicator */}
        <div className="flex items-center gap-2 border-r border-border px-4 py-3 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-green pulse-dot" />
          <span className="font-mono text-[11px] text-green">online</span>
        </div>
        {/* Date */}
        <div className="border-r border-border px-4 py-3 shrink-0">
          <span className="font-mono text-[11px] text-muted">{dateStr}</span>
        </div>
        {/* Live clock */}
        <div className="border-r border-border px-4 py-3 shrink-0">
          <span className="font-mono text-[11px] text-text tabular-nums">{timeStr}</span>
        </div>
        {/* Metrics */}
        <div className="flex flex-1 items-center gap-0 overflow-hidden">
          <StatusPill label="ord" value={words.length}          />
          <StatusPill label="projekt" value={activeProjects.length} />
          <StatusPill label="uppgifter" value={openTodos}           color={openTodos > 0 ? '#d97706' : undefined} />
          {days !== null && (
            <StatusPill label="dagar till HP" value={days} color={days < 30 ? '#e11d48' : days < 90 ? '#d97706' : undefined} />
          )}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="font-display text-3xl text-text">Dashboard</h1>
        <p className="mt-0.5 font-mono text-xs text-muted">// Oscars personliga kontrollpanel</p>
      </div>

      {/* ── Bento grid ── */}
      <div
        ref={gridRef}
        className="bento-grid grid grid-cols-1 md:grid-cols-4 gap-3"
      >

        {/* 1. Fokus — 2×2 */}
        <Card className="col-span-1 md:col-span-2 md:row-span-2" accent="#7c72f5">
          <CardHeader label="fokus.txt" accent="#7c72f5" icon={Layers} />
          <div className="mt-3 flex flex-col gap-3 h-[calc(100%-2.5rem)]">
            <textarea
              className="flex-1 w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2.5 font-sans text-sm text-text placeholder-dim outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/15 transition-all"
              placeholder="Vad vill du uppnå idag?&#10;&#10;_"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MiniStat label="aktiva projekt" value={activeProjects.length} color="#7c72f5" />
              <MiniStat label="öppna uppgifter" value={openTodos} color={openTodos > 0 ? '#d97706' : '#059669'} />
              <MiniStat label="deploy: ok" value={successDeploys} color="#059669" />
            </div>
          </div>
        </Card>

        {/* 2. Projekt */}
        <Card className="col-span-1 row-span-1" accent="#22d3ee" onClick={() => navigate('/projekt')}>
          <CardHeader label="projekt/" accent="#22d3ee" icon={Code2} />
          <div className="mt-2 space-y-1.5">
            {activeProjects.slice(0, 2).map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span
                  className={['h-1.5 w-1.5 rounded-full shrink-0', p.deployStatus === 'building' ? 'pulse-dot' : ''].join(' ')}
                  style={{ backgroundColor: p.deployStatus === 'success' ? '#059669' : p.deployStatus === 'failed' ? '#e11d48' : '#22d3ee' }}
                />
                <span className="truncate font-mono text-[12px] text-text">{p.name}</span>
                <span className="ml-auto font-mono text-[10px] text-dim shrink-0">{p.framework}</span>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <p className="font-mono text-[11px] text-dim">// inga aktiva projekt</p>
            )}
            <p className="pt-1 font-mono text-[10px] text-muted">
              {activeProjects.length} aktiva · {openTodos} öppna uppgifter
            </p>
          </div>
        </Card>

        {/* 3. Högskoleprov */}
        <Card className="col-span-1 row-span-1" accent="#fbbf24" onClick={() => navigate('/hp')}>
          <CardHeader label="högskoleprov/" accent="#fbbf24" icon={GraduationCap} />
          {days !== null ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl text-text">{days}</span>
                <span className="font-mono text-xs text-muted">dagar</span>
              </div>
              <div className="mt-2 h-px w-full bg-border">
                <div
                  className="h-px bg-amber transition-all"
                  style={{ width: `${Math.max(4, 100 - (days / 365) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-muted">
                {new Date(examDate).toLocaleDateString('sv-SE')}
              </p>
            </div>
          ) : (
            <p className="mt-2 font-mono text-[11px] text-dim">// sätt ett datum i HP-modulen</p>
          )}
        </Card>

        {/* 4. Lingvistik — 2×1 */}
        <Card className="col-span-1 md:col-span-2 md:row-span-1" accent="#34d399" onClick={() => navigate('/lingvistik')}>
          <CardHeader label="lingvistik/" accent="#34d399" icon={BookOpen} />
          <div className="mt-2.5 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { lang: 'Fornsvenska', id: 'fornsvenska', color: '#34d399' },
              { lang: 'Svenska',     id: 'svenska',     color: '#7c72f5' },
              { lang: 'Italienska',  id: 'italienska',  color: '#22d3ee' },
              { lang: 'Engelska',    id: 'engelska',    color: '#fbbf24' },
            ].map(({ lang, id, color }) => {
              const count = words.filter(w => w.language === id).length
              const gram  = grammarEntries.filter(e => e.language === id).length
              return (
                <div key={id} className="rounded-lg border border-border bg-surface2 px-2 py-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-mono text-[10px] text-muted truncate">{lang}</span>
                  </div>
                  <p className="font-mono text-lg font-medium leading-none text-text">{count}</p>
                  <p className="font-mono text-[10px] text-dim">{gram} regler</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 5. Engagemang */}
        <Card className="col-span-1 row-span-1" accent="#e11d48" onClick={() => navigate('/engagemang')}>
          <CardHeader label="engagemang/" accent="#e11d48" icon={Users} />
          <div className="mt-2 space-y-1.5">
            {organizations.slice(0, 2).map(o => (
              <div key={o.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose shrink-0" />
                <span className="truncate font-mono text-[12px] text-text">{o.name}</span>
              </div>
            ))}
            {organizations.length === 0 && (
              <p className="font-mono text-[11px] text-dim">// lägg till MUF, UPF…</p>
            )}
            <p className="pt-0.5 font-mono text-[10px] text-muted">
              {organizations.length} org · {platforms.length} plattformar
            </p>
          </div>
        </Card>

        {/* 6. Plattformar */}
        <Card className="col-span-1 row-span-1" accent="#7c72f5" onClick={() => navigate('/engagemang')}>
          <CardHeader label="plattformar/" accent="#7c72f5" icon={Globe} />
          <div className="mt-2 space-y-1.5">
            {platforms.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate font-mono text-[12px] text-text">{p.name}</span>
                </div>
                {p.url && (
                  <ArrowUpRight size={11} className="text-dim shrink-0 ml-1" />
                )}
              </div>
            ))}
            {platforms.length === 0 && (
              <p className="font-mono text-[11px] text-dim">// Substack, Frontend Mentor…</p>
            )}
          </div>
        </Card>

      </div>
    </div>
  )
}

// ─── Sub-komponenter ──────────────────────────────────────────────────────────

function Card({ children, className = '', accent = '#7c72f5', onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        'group relative flex flex-col rounded-2xl border border-border bg-surface p-4',
        'transition-all duration-200',
        onClick ? 'cursor-pointer hover:border-border2 hover:shadow-sm' : '',
        className,
      ].join(' ')}
      style={{
        '--card-accent': accent,
      }}
    >
      {/* Subtle corner glow on hover */}
      {onClick && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at top right, ${accent}0d, transparent 55%)` }}
        />
      )}
      {children}
    </div>
  )
}

function CardHeader({ label, icon: Icon, accent }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: accent + '18', color: accent }}
        >
          <Icon size={13} strokeWidth={2} />
        </div>
        <span className="font-mono text-[11px] text-muted">{label}</span>
      </div>
      <ArrowUpRight size={12} className="text-dim opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )
}

function MiniStat({ label, value, color = '#8080a0' }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="font-mono text-xl font-medium leading-none" style={{ color }}>{value}</p>
      <p className="mt-1 font-mono text-[10px] text-muted">{label}</p>
    </div>
  )
}

function StatusPill({ label, value, color }) {
  return (
    <div className="border-r border-border px-4 py-3 last:border-r-0 shrink-0">
      <span className="font-mono text-[11px]" style={{ color: color ?? 'rgb(var(--color-muted))' }}>
        <span className="text-dim">{label}: </span>
        <span className="font-medium">{value}</span>
      </span>
    </div>
  )
}
