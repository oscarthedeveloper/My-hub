import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import useLenis from '@/hooks/useLenis'
import Dashboard from '@/views/Dashboard'
import ProjectsView from '@/views/projects/ProjectsView'
import ProjectDetail from '@/views/projects/ProjectDetail'
import LinguisticsHome from '@/views/linguistics/LinguisticsHome'
import LanguageLayout from '@/views/linguistics/LanguageLayout'
import WordsView from '@/views/linguistics/shared/WordsView'
import GrammarView from '@/views/linguistics/shared/GrammarView'
import NotesView from '@/views/linguistics/shared/NotesView'
import FonologiView from '@/views/linguistics/fornsvenska/FonologiView'
import LasloggView from '@/views/linguistics/fornsvenska/LasloggView'
import OvningarView from '@/views/linguistics/svenska/OvningarView'
import KonjugationerView from '@/views/linguistics/italienska/KonjugationerView'
import HPView from '@/views/hp/HPView'
import EngagemangView from '@/views/engagemang/EngagemangView'
import PlaneringsView from '@/views/planering/PlaneringsView'

export default function Canvas() {
  const location   = useLocation()
  const canvasRef  = useRef(null)
  const contentRef = useRef(null)

  useLenis(canvasRef, contentRef)

  // GSAP fade on route change
  useEffect(() => {
    if (!contentRef.current) return
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    )
  }, [location.pathname])

  const isPlanering = location.pathname === '/planering'

  return (
    <main className="relative flex-1 overflow-hidden bg-bg">
      {isPlanering ? (
        /* ── Livskarta: helfyllnad, ingen Lenis-scroll ── */
        <div className="absolute inset-0">
          <PlaneringsView />
        </div>
      ) : (
        /* ── Övriga vyer: Lenis-scrollat innehåll ── */
        <div ref={canvasRef} className="h-full overflow-hidden">
          <div ref={contentRef} className="min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/projekt" element={<ProjectsView />} />
              <Route path="/projekt/:id" element={<ProjectDetail />} />

              <Route path="/lingvistik" element={<LinguisticsHome />} />
              <Route path="/lingvistik/:lang" element={<LanguageLayout />}>
                <Route index element={<Navigate to="ordforrad" replace />} />
                <Route path="ordforrad"     element={<WordsView />} />
                <Route path="grammatik"     element={<GrammarView />} />
                <Route path="anteckningar"  element={<NotesView />} />
                <Route path="fonologi"      element={<FonologiView />} />
                <Route path="laslogg"       element={<LasloggView />} />
                <Route path="ovningar"      element={<OvningarView />} />
                <Route path="konjugationer" element={<KonjugationerView />} />
              </Route>

              <Route path="/hp"         element={<HPView />} />
              <Route path="/engagemang" element={<EngagemangView />} />
              <Route path="/planering"  element={<div />} />
            </Routes>
          </div>
        </div>
      )}
    </main>
  )
}
