import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shuffle, Check, X, RotateCcw, ChevronRight } from 'lucide-react'
import { useLinguisticsStore } from '@/store'
import { useFadeIn } from '@/hooks/useGSAP'

const LANGS = [
  { id: 'fornsvenska', label: 'Fornsvenska', color: '#34d399' },
  { id: 'svenska',     label: 'Svenska',     color: '#7c72f5' },
  { id: 'italienska',  label: 'Italienska',  color: '#22d3ee' },
  { id: 'engelska',    label: 'Engelska',    color: '#fbbf24' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function normalize(s) {
  return (s ?? '').toLowerCase().trim().replace(/\s+/g, ' ')
}

// ─── Inställningsskärm ────────────────────────────────────────────────────────

function SetupScreen({ words, onStart }) {
  const ref = useFadeIn()
  const [selectedLangs, setSelectedLangs] = useState(['svenska'])
  const [mode,  setMode]  = useState('write')  // 'write' | 'multi'
  const [count, setCount] = useState(20)

  const pool = useMemo(() =>
    words.filter(w => selectedLangs.includes(w.language) && w.word && w.definition),
    [words, selectedLangs]
  )

  function toggleLang(id) {
    setSelectedLangs(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  function handleStart() {
    const picked = shuffle(pool).slice(0, count === 'all' ? pool.length : count)
    onStart({ words: picked, mode })
  }

  return (
    <div ref={ref} className="mx-auto max-w-lg">
      <h2 className="font-display text-2xl text-text mb-1">Träna ordförråd</h2>
      <p className="font-mono text-xs text-muted mb-8">// Välj inställningar och starta</p>

      {/* Språkval */}
      <Section label="Språk">
        <div className="grid grid-cols-2 gap-2">
          {LANGS.map(lang => {
            const count = words.filter(w => w.language === lang.id && w.word && w.definition).length
            const active = selectedLangs.includes(lang.id)
            return (
              <button
                key={lang.id}
                onClick={() => toggleLang(lang.id)}
                disabled={count === 0}
                className={[
                  'flex items-center justify-between rounded-xl border px-4 py-3 transition-all',
                  active
                    ? 'border-transparent ring-1'
                    : 'border-border bg-surface hover:border-border2 disabled:opacity-30',
                ].join(' ')}
                style={active ? {
                  backgroundColor: lang.color + '12',
                  ringColor: lang.color + '40',
                  borderColor: lang.color + '40',
                  outline: `1px solid ${lang.color}40`,
                } : {}}
              >
                <span className="font-mono text-[13px]" style={{ color: active ? lang.color : 'rgb(var(--color-text))' }}>
                  {lang.label}
                </span>
                <span className="font-mono text-[11px] text-muted">{count} ord</span>
              </button>
            )
          })}
        </div>
        {selectedLangs.length > 1 && (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <Shuffle size={11} /> {pool.length} ord blandas
          </p>
        )}
      </Section>

      {/* Antal ord */}
      <Section label="Antal frågor">
        <div className="flex gap-2 flex-wrap">
          {[10, 20, 50, 'all'].map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              disabled={n !== 'all' && pool.length < n}
              className={[
                'rounded-lg border px-4 py-2 font-mono text-[13px] transition-all disabled:opacity-30',
                count === n
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-surface text-muted hover:text-text hover:border-border2',
              ].join(' ')}
            >
              {n === 'all' ? `Alla (${pool.length})` : n}
            </button>
          ))}
        </div>
      </Section>

      {/* Läge */}
      <Section label="Övningsläge">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ModeCard
            active={mode === 'write'}
            onClick={() => setMode('write')}
            title="Skriv svar"
            desc="Se termen, skriv definitionen. Exakt matchning (ej skiftlägeskänslig)."
          />
          <ModeCard
            active={mode === 'multi'}
            onClick={() => setMode('multi')}
            title="Fyra alternativ"
            desc="Välj rätt definition bland fyra alternativ."
            disabled={pool.length < 4}
          />
        </div>
      </Section>

      <button
        onClick={handleStart}
        disabled={pool.length === 0 || selectedLangs.length === 0}
        className="mt-2 w-full rounded-xl bg-accent/10 px-4 py-3 font-mono text-[13px] font-medium text-accent ring-1 ring-accent/25 transition-all hover:bg-accent/20 disabled:opacity-30"
      >
        Starta session →
      </button>
    </div>
  )
}

// ─── Övningsskärm ─────────────────────────────────────────────────────────────

function QuizScreen({ session, onFinish }) {
  const { words, mode } = session
  const [index,    setIndex]    = useState(0)
  const [input,    setInput]    = useState('')
  const [result,   setResult]   = useState(null)   // null | 'correct' | 'wrong'
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [wrongs,   setWrongs]   = useState([])
  const allWords = useLinguisticsStore(s => s.words)

  const current = words[index]
  const progress = ((index) / words.length) * 100

  // Generera 4 alternativ för multiple choice
  const choices = useMemo(() => {
    if (mode !== 'multi') return []
    const others = allWords
      .filter(w => w.id !== current.id && w.definition && w.definition !== current.definition)
    const distractors = shuffle(others).slice(0, 3).map(w => w.definition)
    return shuffle([current.definition, ...distractors])
  }, [index, mode]) // eslint-disable-line

  function submitWrite(e) {
    e?.preventDefault()
    if (result) return
    const correct = normalize(input) === normalize(current.definition)
    setResult(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    else setWrongs(w => [...w, { word: current, given: input }])
  }

  function handleMultiChoice(choice) {
    if (result) return
    setSelected(choice)
    const correct = choice === current.definition
    setResult(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    else setWrongs(w => [...w, { word: current, given: choice }])
  }

  function next() {
    if (index + 1 >= words.length) {
      onFinish({ score, total: words.length, wrongs })
    } else {
      setIndex(i => i + 1)
      setInput('')
      setResult(null)
      setSelected(null)
    }
  }

  const lang = LANGS.find(l => l.id === current.language)
  const color = lang?.color ?? '#7c72f5'

  return (
    <div className="mx-auto max-w-lg">

      {/* Förloppsbar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted">{index + 1} / {words.length}</span>
          <span className="font-mono text-[11px]" style={{ color: '#34d399' }}>{score} rätt</span>
        </div>
        <div className="h-1 w-full rounded-full bg-surface2">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Fråga */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-dim">
          {lang?.label ?? current.language}
          {current.wordClass && current.wordClass !== '—' && ` · ${current.wordClass}`}
        </p>
        <p className="font-display text-3xl text-text">{current.word}</p>
        {current.hpSection && current.hpSection !== '—' && (
          <span
            className="mt-2 inline-block rounded px-2 py-0.5 font-mono text-[11px]"
            style={{ backgroundColor: color + '18', color }}
          >
            {current.hpSection}
          </span>
        )}
      </div>

      {/* Svarsdel */}
      {mode === 'write' ? (
        <form onSubmit={submitWrite} className="space-y-3">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!!result}
            placeholder="Skriv definitionen…"
            className={[
              'w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition-all',
              result === 'correct' ? 'border-green bg-green/5 text-green'
              : result === 'wrong'   ? 'border-rose/50 bg-rose/5 text-text'
              : 'border-border bg-surface text-text focus:border-accent/40 focus:ring-1 focus:ring-accent/15',
            ].join(' ')}
          />

          {!result && (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full rounded-xl bg-accent/10 py-2.5 font-mono text-[13px] text-accent ring-1 ring-accent/25 transition-all hover:bg-accent/20 disabled:opacity-30"
            >
              Kontrollera
            </button>
          )}

          {result && (
            <Feedback result={result} correct={current.definition} given={input} onNext={next} last={index + 1 === words.length} />
          )}
        </form>
      ) : (
        <div className="space-y-2">
          {choices.map((choice, i) => {
            const isCorrect = choice === current.definition
            const isSelected = choice === selected
            let style = 'border-border bg-surface text-text hover:border-border2'
            if (result) {
              if (isCorrect)       style = 'border-green/50 bg-green/8 text-green'
              else if (isSelected) style = 'border-rose/50 bg-rose/8 text-rose'
              else                 style = 'border-border bg-surface text-dim'
            }
            return (
              <button
                key={i}
                onClick={() => handleMultiChoice(choice)}
                disabled={!!result}
                className={`w-full rounded-xl border px-4 py-3 text-left font-mono text-sm transition-all ${style}`}
              >
                {choice}
              </button>
            )
          })}

          {result && (
            <div className="pt-2">
              <Feedback result={result} correct={current.definition} given={selected} onNext={next} last={index + 1 === words.length} multiChoice />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Resultatskärm ────────────────────────────────────────────────────────────

function ResultScreen({ result, onRestart, onRetryWrong }) {
  const ref = useFadeIn()
  const { score, total, wrongs } = result
  const pct = Math.round((score / total) * 100)
  const color = pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#e11d48'

  return (
    <div ref={ref} className="mx-auto max-w-lg">
      <div className="mb-8 rounded-2xl border border-border bg-surface p-6 md:p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-3">// Resultat</p>
        <p className="font-display text-6xl mb-2" style={{ color }}>{pct}%</p>
        <p className="font-mono text-sm text-muted">{score} av {total} rätt</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 font-mono text-[13px] text-muted transition-all hover:text-text hover:border-border2"
        >
          <RotateCcw size={13} /> Ny session
        </button>
        {wrongs.length > 0 && (
          <button
            onClick={() => onRetryWrong(wrongs)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent/10 py-3 font-mono text-[13px] text-accent ring-1 ring-accent/25 transition-all hover:bg-accent/20"
          >
            Öva {wrongs.length} missade →
          </button>
        )}
      </div>

      {wrongs.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-dim">// Missade ord</p>
          <div className="space-y-2">
            {wrongs.map(({ word, given }, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-sm font-medium text-text">{word.word}</span>
                  <span className="font-mono text-[10px] text-dim">{word.language}</span>
                </div>
                <p className="font-mono text-xs text-green">✓ {word.definition}</p>
                {given && <p className="font-mono text-xs text-rose/70">✗ {given}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Huvud-vy ─────────────────────────────────────────────────────────────────

export default function TranaView() {
  const navigate = useNavigate()
  const { words } = useLinguisticsStore()
  const [phase,   setPhase]   = useState('setup')   // 'setup' | 'quiz' | 'result'
  const [session, setSession] = useState(null)
  const [result,  setResult]  = useState(null)

  const handleStart = useCallback((s) => {
    setSession(s)
    setPhase('quiz')
  }, [])

  const handleFinish = useCallback((r) => {
    setResult(r)
    setPhase('result')
  }, [])

  const handleRestart = useCallback(() => {
    setSession(null)
    setResult(null)
    setPhase('setup')
  }, [])

  const handleRetryWrong = useCallback((wrongs) => {
    const retryWords = shuffle(wrongs.map(w => w.word))
    setSession(s => ({ ...s, words: retryWords }))
    setResult(null)
    setPhase('quiz')
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Tillbaka */}
      <button
        onClick={() => phase === 'setup' ? navigate('/lingvistik') : handleRestart()}
        className="mb-6 flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={13} />
        {phase === 'setup' ? 'Lingvistik' : 'Avsluta session'}
      </button>

      {phase === 'setup' && (
        <SetupScreen words={words} onStart={handleStart} />
      )}
      {phase === 'quiz' && session && (
        <QuizScreen session={session} onFinish={handleFinish} />
      )}
      {phase === 'result' && result && (
        <ResultScreen result={result} onRestart={handleRestart} onRetryWrong={handleRetryWrong} />
      )}
    </div>
  )
}

// ─── Hjälpkomponenter ─────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div className="mb-6">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-dim">// {label}</p>
      {children}
    </div>
  )
}

function ModeCard({ active, onClick, title, desc, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-xl border p-4 text-left transition-all disabled:opacity-30',
        active
          ? 'border-accent/40 bg-accent/8 ring-1 ring-accent/20'
          : 'border-border bg-surface hover:border-border2',
      ].join(' ')}
    >
      <p className={`font-mono text-[13px] font-medium mb-1 ${active ? 'text-accent' : 'text-text'}`}>{title}</p>
      <p className="font-mono text-[11px] text-muted leading-relaxed">{desc}</p>
    </button>
  )
}

function Feedback({ result, correct, given, onNext, last, multiChoice }) {
  return (
    <div className={[
      'rounded-xl border p-4',
      result === 'correct' ? 'border-green/30 bg-green/5' : 'border-rose/30 bg-rose/5',
    ].join(' ')}>
      <div className="flex items-start gap-2 mb-3">
        {result === 'correct'
          ? <Check size={14} className="mt-0.5 shrink-0 text-green" />
          : <X     size={14} className="mt-0.5 shrink-0 text-rose"  />}
        <div className="min-w-0">
          {result === 'correct'
            ? <p className="font-mono text-[12px] text-green">Rätt!</p>
            : <>
                <p className="font-mono text-[12px] text-rose mb-1">Fel</p>
                <p className="font-mono text-[11px] text-muted">
                  <span className="text-dim">rätt svar: </span>{correct}
                </p>
              </>}
        </div>
      </div>
      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface2 py-2 font-mono text-[12px] text-text transition-all hover:bg-surface2/80"
      >
        {last ? 'Se resultat' : 'Nästa'} <ChevronRight size={13} />
      </button>
    </div>
  )
}
