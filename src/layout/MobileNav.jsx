import { NavLink, useLocation } from 'react-router-dom'
import { Home, Code2, BookOpen, GraduationCap, Users, Map } from 'lucide-react'

const NAV = [
  { path: '/',           label: 'Start',      icon: Home,          color: '#7c72f5', exact: true },
  { path: '/projekt',    label: 'Projekt',    icon: Code2,         color: '#22d3ee' },
  { path: '/lingvistik', label: 'Lingvistik', icon: BookOpen,      color: '#34d399' },
  { path: '/hp',         label: 'HP',         icon: GraduationCap, color: '#fbbf24' },
  { path: '/engagemang', label: 'Engagemang', icon: Users,         color: '#e11d48' },
  { path: '/planering',  label: 'Livskarta',  icon: Map,           color: '#f97316' },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="flex lg:hidden shrink-0 items-center border-t border-border bg-surface pb-safe">
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
              size={21}
              strokeWidth={isActive ? 2.2 : 1.6}
              style={{ color: isActive ? item.color : 'rgb(var(--color-dim))' }}
            />
            <span
              className="font-mono text-[10px] leading-none"
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
