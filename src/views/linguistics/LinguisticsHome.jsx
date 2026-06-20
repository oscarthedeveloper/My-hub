import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Hash, FileText, BookMarked, HardDriveDownload, Dumbbell } from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import { useFadeIn, useStaggerIn } from '@/hooks/useGSAP'
import { syncWordsToFile } from '@/lib/wordExport'

const LANGS = [
  {
    id: 'fornsvenska',
    label: 'Fornsvenska',
    subtitle: 'Ordförråd · Grammatik · Fonologi · Läslogg',
    color: '#34d399',
    bg: '#34d39912',
    defaultTab: 'ordforrad',
    flag: 'ᚠᚢᚦ',
  },
  {
    id: 'svenska',
    label: 'Svenska',
    subtitle: 'Ordförråd · Grammatik · HP-övningar',
    color: '#7c72f5',
    bg: '#7c72f512',
    defaultTab: 'ordforrad',
    flag: 'SV',
  },
  {
    id: 'italienska',
    label: 'Italienska',
    subtitle: 'Ordförråd · Grammatik · Konjugationer',
    color: '#22d3ee',
    bg: '#22d3ee12',
    defaultTab: 'ordforrad',
    flag: 'IT',
  },
  {
    id: 'engelska',
    label: 'Engelska',
    subtitle: 'Ordförråd · Grammatik · Anteckningar',
    color: '#fbbf24',
    bg: '#fbbf2412',
    defaultTab: 'ordforrad',
    flag: 'EN',
  },
]

export default function LinguisticsHome() {
  const ref     = useFadeIn()
  const gridRef = useStaggerIn(0.06)
  const navigate = useNavigate()
  const { words, notes, grammarEntries, readingLog } = useLinguisticsStore()

  const totalWords = words.length
  const totalNotes = notes.length + grammarEntries.length

  const [syncStatus, setSyncStatus] = useState(null) // null | 'syncing' | { added, updated, kept, total } | { error } | { cancelled } | { fallback }

  async function handleSync() {
    setSyncStatus('syncing')
    const result = await syncWordsToFile(words)
    setSyncStatus(result)
    if (!result.cancelled && !result.error) {
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  return (
    <div ref={ref} className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-text">Lingvistik</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {totalWords} ord · {totalNotes} anteckningar · {readingLog.length} läsposter
          </p>
        </div>

        {/* ── Åtgärder ── */}
        <div className="flex flex-col gap-2 md:items-end">
          <button
            onClick={() => navigate('/lingvistik/trana')}
            disabled={totalWords === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/8 px-3 py-2.5 font-mono text-[12px] text-accent transition-all hover:bg-accent/15 disabled:opacity-40 md:justify-start"
          >
            <Dumbbell size={13} /> Träna ordförråd
          </button>
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing' || totalWords === 0}
            title="Slå ihop och spara alla ord i en lokal JSON-fil"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-[12px] text-muted transition-all hover:border-border2 hover:text-text disabled:opacity-40 md:justify-start"
          >
            <HardDriveDownload size={13} />
            {syncStatus === 'syncing' ? 'Synkar…' : 'Synka ordbok till fil'}
          </button>
          {syncStatus && syncStatus !== 'syncing' && (
            <p className="font-mono text-[11px] text-center md:text-right" style={{
              color: syncStatus.error ? '#e11d48'
                   : syncStatus.cancelled ? 'rgb(var(--color-dim))'
                   : '#34d399'
            }}>
              {syncStatus.error    ? `// fel: ${syncStatus.error}`
               : syncStatus.cancelled ? '// avbruten'
               : syncStatus.fallback  ? `// nedladdad (${syncStatus.total} ord)`
               : `// +${syncStatus.added} nya · ${syncStatus.updated} uppdaterade · ${syncStatus.total} totalt`}
            </p>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mb-7 mt-5 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">— 4 språk</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Language cards ── */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LANGS.map(lang => {
          const langWords   = words.filter(w => w.language === lang.id).length
          const langNotes   = notes.filter(n => n.language === lang.id).length
          const langGrammar = grammarEntries.filter(e => e.language === lang.id).length
          const langReading = readingLog.filter(r => r.language === lang.id).length

          return (
            <button
              key={lang.id}
              onClick={() => navigate(`/lingvistik/${lang.id}/${lang.defaultTab}`)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all duration-200 hover:border-[color:var(--lang-color)]/30 hover:shadow-sm"
              style={{ '--lang-color': lang.color }}
            >
              {/* Accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-0.5 transition-all duration-200 group-hover:w-1"
                style={{ backgroundColor: lang.color }}
              />

              <div className="p-6 pl-7">
                {/* Top */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className="mb-2 inline-flex items-center justify-center rounded-lg px-2 py-1 font-mono text-xs font-medium"
                      style={{ backgroundColor: lang.bg, color: lang.color }}
                    >
                      {lang.flag}
                    </div>
                    <h2 className="font-display text-xl text-text">{lang.label}</h2>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">{lang.subtitle}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat icon={Hash}       value={langWords}   label="ord"          color={lang.color} />
                  <Stat icon={FileText}   value={langGrammar} label="grammatik"     color={lang.color} />
                  <Stat icon={BookOpen}   value={langNotes}   label="anteckningar"  color={lang.color} />
                  <Stat icon={BookMarked} value={langReading} label="läsposter"     color={lang.color} />
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">
                    {langWords === 0 ? '// tomt lexikon' : `// ${langWords} inlästa ord`}
                  </span>
                  <span
                    className="font-mono text-[11px] opacity-0 transition-all duration-200 group-hover:opacity-100"
                    style={{ color: lang.color }}
                  >
                    öppna →
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-lg border border-border bg-surface2 p-2.5 text-center">
      <p className="font-mono text-lg font-medium leading-none text-text">{value}</p>
      <p className="mt-1 font-mono text-[10px] text-muted">{label}</p>
    </div>
  )
}
