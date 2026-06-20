import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  useThemeStore,
  useProjectStore,
  useLinguisticsStore,
  useHPStore,
  useEngagemangStore,
  usePlaneringsStore,
} from '@/store'

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

// ─── Logotyp ──────────────────────────────────────────────────────────────────

function NetworkLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="11" y1="11" x2="3.5"  y2="3.5"  stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" />
      <line x1="11" y1="11" x2="18.5" y2="3.5"  stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" />
      <line x1="11" y1="11" x2="3.5"  y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" />
      <line x1="11" y1="11" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" />
      <circle cx="3.5"  cy="3.5"  r="1.8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="18.5" cy="3.5"  r="1.8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="3.5"  cy="18.5" r="1.8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="18.5" cy="18.5" r="1.8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="11"   cy="11"   r="3.5" fill="currentColor" />
    </svg>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const location  = useLocation()
  const now       = useClock()
  const { theme, toggleTheme } = useThemeStore()

  const { projects, todos }          = useProjectStore()
  const { words }                    = useLinguisticsStore()
  const { daysUntilExam }            = useHPStore()
  const { organizations, platforms } = useEngagemangStore()
  const { epochs }                   = usePlaneringsStore()

  const activeProjects = projects.filter(p => p.status === 'active').length
  const openTodos      = todos.filter(t => t.status !== 'done').length
  const days           = daysUntilExam()
  const engCount       = organizations.length + platforms.length

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      color: '#7c72f5',
      stat: now.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
    },
    {
      id: 'projekt',
      label: 'Projekt',
      path: '/projekt',
      color: '#22d3ee',
      stat: activeProjects > 0 ? `${activeProjects} aktiva` : null,
      statAlert: openTodos > 0,
    },
    {
      id: 'lingvistik',
      label: 'Lingvistik',
      path: '/lingvistik',
      color: '#34d399',
      stat: words.length > 0 ? `${words.length} ord` : null,
    },
    {
      id: 'hp',
      label: 'Högskoleprov',
      path: '/hp',
      color: '#fbbf24',
      stat: days !== null ? `${days}d` : null,
      statAlert: days !== null && days < 60,
    },
    {
      id: 'engagemang',
      label: 'Engagemang',
      path: '/engagemang',
      color: '#e11d48',
      stat: engCount > 0 ? `${engCount}` : null,
    },
    {
      id: 'planering',
      label: 'Livskarta',
      path: '/planering',
      color: '#f97316',
      stat: epochs.length > 0 ? `${epochs.length} epoker` : null,
    },
  ]

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut()
    else window.location.reload()
  }

  return (
    <aside
      className="relative z-10 hidden lg:flex h-full flex-col border-r border-border bg-surface"
      style={{ width: 240, minWidth: 240, flexShrink: 0 }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
          <NetworkLogo size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[14px] font-bold leading-tight text-text">
            Oscars nätverk
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green pulse-dot" />
            <span className="font-mono text-[10px] text-muted">online · v1.0</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(item => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={[
                'group mb-0.5 flex items-center justify-between rounded-xl px-3 py-2.5 transition-all',
                isActive ? 'bg-surface2 ring-1 ring-border' : 'hover:bg-surface2/60',
              ].join(' ')}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive ? item.color : 'transparent',
                    boxShadow: isActive ? `0 0 6px ${item.color}80` : 'none',
                    border: isActive ? 'none' : `1.5px solid ${item.color}60`,
                  }}
                />
                <span className={[
                  'font-mono text-[12px] truncate transition-colors',
                  isActive ? 'text-text font-medium' : 'text-muted group-hover:text-text',
                ].join(' ')}>
                  {item.label}
                </span>
              </div>
              {item.stat && (
                <span
                  className="ml-2 shrink-0 rounded font-mono text-[10px] px-1.5 py-0.5 tabular-nums"
                  style={{
                    backgroundColor: item.statAlert ? `${item.color}20` : 'transparent',
                    color: item.statAlert ? item.color : 'rgb(var(--color-muted))',
                    border: item.statAlert ? `1px solid ${item.color}30` : 'none',
                  }}
                >
                  {item.stat}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted tabular-nums">{timeStr}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface2 hover:text-text"
              title={theme === 'dark' ? 'Ljust läge' : 'Mörkt läge'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-dim transition-colors hover:bg-surface2 hover:text-muted"
              title="Logga ut"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
