import { useState } from 'react'
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, X, Plus, Lock, Trash2, Check } from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

// Compatibility shim for any legacy imports
export const LANG_CONFIG = {}

const TAB_TYPE_LABELS = {
  docs:          'Dokument-kort',
  notes:         'Anteckningar',
  fonologi:      'Fonologi',
  ovningar:      'Övningar',
  konjugationer: 'Konjugationer',
}

// ─── Flik-hanteringspanel ─────────────────────────────────────────────────────

function TabManager({ language, onClose }) {
  const { addCustomTab, removeCustomTab } = useLinguisticsStore()
  const [label, setLabel]       = useState('')
  const [type, setType]         = useState('notes')
  const [delTabId, setDelTabId] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    if (!label.trim()) return
    addCustomTab(language.id, { label: label.trim(), type })
    setLabel('')
    setType('notes')
  }

  const inputCls = 'rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[12px] text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all'

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface2 p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] font-medium text-text flex items-center gap-1.5">
          <Settings size={11} /> Hantera flikar
        </span>
        <button onClick={onClose} className="rounded p-1 text-dim hover:text-muted transition-colors">
          <X size={13} />
        </button>
      </div>

      {/* Tab list */}
      <div className="space-y-1 mb-4">
        {language.tabs.map(tab => (
          <div key={tab.id} className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[12px] text-text truncate">{tab.label}</span>
              <span className="font-mono text-[10px] text-dim bg-surface2 px-1.5 py-0.5 rounded shrink-0">
                {TAB_TYPE_LABELS[tab.type] ?? tab.type}
              </span>
            </div>
            {tab.builtin ? (
              <Lock size={11} className="text-dim shrink-0 ml-2" title="Inbyggd flik" />
            ) : delTabId === tab.id ? (
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <span className="font-mono text-[10px] text-dim">Säker?</span>
                <button
                  onClick={() => { removeCustomTab(language.id, tab.id); setDelTabId(null) }}
                  className="rounded px-1.5 py-0.5 bg-rose/10 text-rose font-mono text-[10px] hover:bg-rose/20 transition-colors"
                >
                  <Check size={10} />
                </button>
                <button onClick={() => setDelTabId(null)} className="rounded p-0.5 text-dim hover:text-muted">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDelTabId(tab.id)}
                className="ml-2 shrink-0 rounded p-1 text-dim hover:text-rose transition-colors"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Fliknamn…"
          className={inputCls + ' flex-1 min-w-[120px]'}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className={inputCls + ' shrink-0'}
        >
          <option value="notes">Anteckningar</option>
          <option value="docs">Dokument-kort</option>
        </select>
        <button
          type="submit"
          disabled={!label.trim()}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted hover:text-text hover:border-border2 transition-all disabled:opacity-30"
        >
          <Plus size={11} /> Lägg till
        </button>
      </form>
    </div>
  )
}

// ─── LanguageLayout ───────────────────────────────────────────────────────────

export default function LanguageLayout() {
  const { lang } = useParams()
  const navigate  = useNavigate()
  const ref       = useFadeIn()
  const { languages } = useLinguisticsStore()
  const [managingTabs, setManagingTabs] = useState(false)

  const language = languages.find(l => l.id === lang)

  if (!language) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm text-muted">// Okänt språk: {lang}</p>
      </div>
    )
  }

  const bg = language.color + '12'

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
            style={{ backgroundColor: bg, color: language.color }}
          >
            {language.flag}
          </div>
          <h1 className="font-display text-3xl text-text">{language.label}</h1>
        </div>
      </div>

      {/* ── Secondary nav ── */}
      <div className="mb-4 flex items-end gap-0.5 border-b border-border overflow-x-auto">
        {language.tabs.map(tab => (
          <NavLink
            key={tab.id}
            to={`/lingvistik/${lang}/${tab.id}`}
            className={({ isActive }) => [
              'shrink-0',
              'relative px-4 py-2.5 font-mono text-[12px] transition-all duration-150',
              isActive ? 'text-text' : 'text-muted hover:text-text',
            ].join(' ')}
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ backgroundColor: language.color }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Manage tabs button */}
        <button
          onClick={() => setManagingTabs(v => !v)}
          className={[
            'ml-auto shrink-0 mb-1 flex items-center gap-1 rounded-lg px-2 py-1.5 font-mono text-[10px] transition-all',
            managingTabs
              ? 'bg-surface2 text-text border border-border'
              : 'text-dim hover:text-muted',
          ].join(' ')}
          title="Hantera flikar"
        >
          <Settings size={11} />
          <span className="hidden sm:inline">Hantera</span>
        </button>
      </div>

      {/* ── Tab management panel ── */}
      {managingTabs && (
        <TabManager language={language} onClose={() => setManagingTabs(false)} />
      )}

      {/* ── Page content ── */}
      <Outlet />
    </div>
  )
}
