import { NavLink, Routes, Route, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useFadeIn } from '@/hooks/useGSAP'
import FornsvenskaView from './fornsvenska/FornsvenskaView'
import SvenskaView from './svenska/SvenskaView'
import ItalianskaView from './italienska/ItalianskaView'
import EngelskaView from './engelska/EngelskaView'

const LANGS = [
  { id: 'fornsvenska', label: 'Fornsvenska', path: '/lingvistik/fornsvenska', color: '#34d399' },
  { id: 'svenska',     label: 'Svenska',     path: '/lingvistik/svenska',     color: '#7c72f5' },
  { id: 'italienska',  label: 'Italienska',  path: '/lingvistik/italienska',  color: '#22d3ee' },
  { id: 'engelska',    label: 'Engelska',    path: '/lingvistik/engelska',    color: '#fbbf24' },
]

export default function LinguisticsView() {
  const ref = useFadeIn()
  const location = useLocation()

  // Show sub-nav + route outlet
  return (
    <div ref={ref} className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface2 ring-1 ring-border">
          <BookOpen size={18} strokeWidth={1.8} className="text-muted" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text">Lingvistik</h1>
          <p className="text-xs text-muted">Fornsvenska · Svenska · Italienska · Engelska</p>
        </div>
      </div>

      {/* Language tabs */}
      <div className="mb-8 flex gap-1 rounded-xl border border-border bg-surface p-1 w-fit">
        {LANGS.map(lang => {
          const isActive = location.pathname.startsWith(lang.path)
          return (
            <NavLink
              key={lang.id}
              to={lang.path}
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                isActive ? 'bg-surface2 text-text ring-1 ring-border' : 'text-muted hover:text-text',
              ].join(' ')}
            >
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: isActive ? lang.color : 'transparent', transition: 'background-color 0.2s' }}
              />
              {lang.label}
            </NavLink>
          )
        })}
      </div>

      {/* Sub-routes */}
      <Routes>
        <Route path="fornsvenska/*" element={<FornsvenskaView />} />
        <Route path="svenska/*"     element={<SvenskaView />} />
        <Route path="italienska/*"  element={<ItalianskaView />} />
        <Route path="engelska/*"    element={<EngelskaView />} />
        <Route index element={<LinguisticsHome />} />
      </Routes>
    </div>
  )
}

function LinguisticsHome() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted">Välj ett språk ovan för att komma igång.</p>
    </div>
  )
}
