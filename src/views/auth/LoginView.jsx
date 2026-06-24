import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hasRemoteData, pushAllCollections, pullAllCollections } from '@/lib/sync'
import { storage, PREFIX } from '@/lib/storage'

// ─── LoginView ────────────────────────────────────────────────────────────────

export default function LoginView() {
  const [username, setUsername] = useState('')
  const [pass,   setPass]   = useState('')
  const [error,  setError]  = useState(null)
  const [busy,   setBusy]   = useState(false)
  const [status, setStatus] = useState(null)       // info-meddelande under inloggning

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setStatus(null)

    const email = `${username.trim().toLowerCase()}@hub.local`

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (error) throw error

      setStatus('Inloggad — synkar data…')

      // Kontrollera om Supabase har data sedan tidigare
      const remote = await hasRemoteData()

      if (remote) {
        // Hämta ned från Supabase → skriver över localStorage
        await pullAllCollections(PREFIX)
        setStatus('Data hämtad från Supabase.')
      } else {
        // Första inloggningen: ladda upp befintlig localStorage-data
        const localData = storage.export()
        const hasLocal  = Object.keys(localData).length > 0

        if (hasLocal) {
          setStatus('Migrerar lokal data till Supabase…')
          await pushAllCollections(localData)
        }
      }

      // App.jsx plockar upp sessionen via onAuthStateChange → visar hubben
    } catch (err) {
      setError(err.message ?? 'Något gick fel')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-bg" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Subtilt grid-mönster */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--color-text)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-text)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logotyp */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/25">
            <NetworkLogo size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-text">Oscars nätverk</h1>
          <p className="mt-1 font-mono text-[11px] text-muted">Personlig hub · v1.0</p>
        </div>

        {/* Formulär */}
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <p className="mb-5 font-mono text-[11px] font-medium text-muted">// Logga in</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label="Användarnamn"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder=""
              disabled={busy}
              required
            />
            <Field
              label="Lösenord"
              type="password"
              value={pass}
              onChange={setPass}
              placeholder="••••••••"
              disabled={busy}
              required
            />

            {error && (
              <p className="rounded-lg bg-rose/10 px-3 py-2 font-mono text-[11px] text-rose ring-1 ring-rose/20">
                {error}
              </p>
            )}

            {status && (
              <p className="rounded-lg bg-accent/8 px-3 py-2 font-mono text-[11px] text-accent ring-1 ring-accent/15">
                {status}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-accent/10 px-4 py-2.5 font-mono text-[12px] font-medium text-accent ring-1 ring-accent/25 transition-all hover:bg-accent/20 disabled:opacity-40"
            >
              {busy ? 'Loggar in…' : 'Logga in'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

// ─── Hjälpkomponenter ─────────────────────────────────────────────────────────

function Field({ label, type, value, onChange, placeholder, disabled, required }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 font-mono text-[12px] text-text placeholder-dim outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/15 disabled:opacity-40"
      />
    </div>
  )
}

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
