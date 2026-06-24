import { NavLink, useLocation } from 'react-router-dom'
import { Home, Code2, BookOpen, GraduationCap, Users, Map, Menu, BookMarked, CalendarDays } from 'lucide-react'

const NAV = [
  { path: '/',              label: 'Start',       icon: Home,          color: '#7c72f5', exact: true },
  { path: '/projekt',       label: 'Projekt',     icon: Code2,         color: '#22d3ee' },
  { path: '/lingvistik',    label: 'Lingvistik',  icon: BookOpen,      color: '#34d399' },
  { path: '/hp',            label: 'HP',          icon: GraduationCap, color: '#fbbf24' },
  { path: '/lasning',       label: 'Läsning',     icon: BookMarked,    color: '#a78bfa' },
  { path: '/engagemang',    label: 'Engagemang',  icon: Users,         color: '#e11d48' },
  { path: '/vardagskarta',  label: 'Vardag',      icon: CalendarDays,  color: '#f472b6' },
  { path: '/planering',     label: 'Livskarta',   icon: Map,           color: '#f97316' },
]

export default function MobileNav({ onMenuOpen }) {
  const location = useLocation()

  return (
    <nav className="flex lg:hidden shrink-0 items-stretch border-t border-border bg-surface pb-safe">
      {/* Hamburgermeny — öppnar sidebar-drawer */}
      <button
        onClick={onMenuOpen}
        className="flex flex-col items-center justify-center gap-1 px-2 min-h-[52px] text-dim hover:text-muted transition-colors"
        aria-label="Öppna meny"
      >
        <Menu size={19} strokeWidth={1.6} />
        <span className="font-mono text-[9px] leading-none">Meny</span>
      </button>

      {/* Nav-länkar */}
      {NAV.map(item => {
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-1 flex-col items-center gap-1 py-3 min-h-[52px] justify-center transition-opacity"
          >
            <Icon
              size={19}
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
    </nav>
  )
}
