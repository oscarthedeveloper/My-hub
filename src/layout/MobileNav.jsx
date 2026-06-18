import { NavLink, useLocation } from 'react-router-dom'
import { Home, Code2, BookOpen, GraduationCap, Users, Map, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NAV = [
  { path: '/',           label: 'Start',     icon: Home,          color: '#7c72f5', exact: true },
  { path: '/projekt',    label: 'Projekt',   icon: Code2,         color: '#22d3ee' },
  { path: '/lingvistik', label: 'Lingvistik',icon: BookOpen,      color: '#34d399' },
  { path: '/hp',         label: 'HP',        icon: GraduationCap, color: '#fbbf24' },
  { path: '/engagemang', label: 'Engagemang',icon: Users,         color: '#e11d48' },
  { path: '/planering',  label: 'Livskarta', icon: Map,           color: '#f97316' },
]

export default function MobileNav() {
  const location = useLocation()

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut()
    else window.location.reload()
  }

  return (
    <nav className="flex md:hidden shrink-0 items-center border-t border-border bg-surface px-1 pb-safe">
      {NAV.map(item => {
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-opacity"
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.2 : 1.6}
              style={{ color: isActive ? item.color : 'rgb(var(--color-dim))' }}
            />
            <span
              className="font-mono text-[9px] leading-none"
              style={{ color: isActive ? item.color : 'rgb(var(--color-dim))' }}
            >
              {item.label}
            </span>
          </NavLink>
        )
      })}

      {/* Logga ut */}
      <button
        onClick={handleLogout}
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-dim transition-opacity hover:text-muted"
      >
        <LogOut size={20} strokeWidth={1.6} />
        <span className="font-mono text-[9px] leading-none">Logga ut</span>
      </button>
    </nav>
  )
}
