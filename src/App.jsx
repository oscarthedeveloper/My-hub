import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import Sidebar from '@/layout/Sidebar'
import Canvas from '@/layout/Canvas'
import MobileNav from '@/layout/MobileNav'
import LoginView from '@/views/auth/LoginView'

export default function App() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    if (!supabase) {
      setUser({ id: 'local', email: 'local' })
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          <span className="font-mono text-[11px] text-muted">Ansluter…</span>
        </div>
      </div>
    )
  }

  if (!user) return <LoginView />

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Subtilt grid-mönster */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,20,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Sidebar: dold på mobil, synlig på md+ */}
      <Sidebar />

      {/* Huvud-innehåll + mobil-nav staplade vertikalt */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Canvas />
        <MobileNav />
      </div>
    </div>
  )
}
