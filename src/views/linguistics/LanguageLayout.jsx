import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useFadeIn } from '@/hooks/useGSAP'

// Per-language configuration
const LANG_CONFIG = {
  fornsvenska: {
    label: 'Fornsvenska',
    color: '#34d399',
    bg: '#34d39912',
    flag: 'ᚠᚢᚦ',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd'    },
      { id: 'grammatik',    label: 'Grammatik'    },
      { id: 'fonologi',     label: 'Fonologi'     },
      { id: 'laslogg',      label: 'Läslogg'      },
      { id: 'anteckningar', label: 'Anteckningar' },
    ],
  },
  svenska: {
    label: 'Svenska',
    color: '#7c72f5',
    bg: '#7c72f512',
    flag: 'SV',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd'    },
      { id: 'grammatik',    label: 'Grammatik'    },
      { id: 'ovningar',     label: 'Övningar'     },
      { id: 'anteckningar', label: 'Anteckningar' },
    ],
  },
  italienska: {
    label: 'Italienska',
    color: '#22d3ee',
    bg: '#22d3ee12',
    flag: 'IT',
    tabs: [
      { id: 'ordforrad',      label: 'Ordförråd'      },
      { id: 'grammatik',      label: 'Grammatik'       },
      { id: 'konjugationer',  label: 'Konjugationer'  },
      { id: 'anteckningar',   label: 'Anteckningar'   },
    ],
  },
  engelska: {
    label: 'Engelska',
    color: '#fbbf24',
    bg: '#fbbf2412',
    flag: 'EN',
    tabs: [
      { id: 'ordforrad',    label: 'Ordförråd'    },
      { id: 'grammatik',    label: 'Grammatik'    },
      { id: 'anteckningar', label: 'Anteckningar' },
    ],
  },
}

export { LANG_CONFIG }

export default function LanguageLayout() {
  const { lang } = useParams()
  const navigate = useNavigate()
  const ref = useFadeIn()
  const config = LANG_CONFIG[lang]

  if (!config) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm text-muted">// Okänt språk: {lang}</p>
      </div>
    )
  }

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/lingvistik')}
          className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={12} /> lingvistik
        </button>

        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-semibold"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.flag}
          </div>
          <div>
            <h1 className="font-display text-3xl text-text">{config.label}</h1>
          </div>
        </div>
      </div>

      {/* ── Secondary nav ── */}
      <div className="mb-8 flex gap-0.5 border-b border-border overflow-x-auto">
        {config.tabs.map(tab => (
          <NavLink
            key={tab.id}
            to={`/lingvistik/${lang}/${tab.id}`}
            className={({ isActive }) => [
              'shrink-0',
              'relative px-4 py-2.5 font-mono text-[12px] transition-all duration-150',
              isActive
                ? 'text-text'
                : 'text-muted hover:text-text',
            ].join(' ')}
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ backgroundColor: config.color }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* ── Page content ── */}
      <Outlet />
    </div>
  )
}
