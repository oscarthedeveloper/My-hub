import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import useLenis from '@/hooks/useLenis'
import { useLinguisticsStore } from '@/store'
import Dashboard from '@/views/Dashboard'
import ProjectsView from '@/views/projects/ProjectsView'
import ProjectDetail from '@/views/projects/ProjectDetail'
import LinguisticsHome from '@/views/linguistics/LinguisticsHome'
import TranaView from '@/views/linguistics/TranaView'
import LanguageLayout from '@/views/linguistics/LanguageLayout'
import TabRenderer from '@/views/linguistics/TabRenderer'
import HPView from '@/views/hp/HPView'
import LasningView from '@/views/lasning/LasningView'
import EngagemangView from '@/views/engagemang/EngagemangView'
import VardagskarteView from '@/views/vardagskarta/VardagskarteView'
import PlaneringsView from '@/views/planering/PlaneringsView'

// Redirects to the first tab of a language (dynamic)
function LangIndexRedirect() {
  const { lang } = useParams()
  const { languages } = useLinguisticsStore()
  const language = languages.find(l => l.id === lang)
  const first = language?.tabs[0]?.id ?? 'ordforrad'
  return <Navigate to={first} replace />
}

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
        <div ref={canvasRef} className="h-full overflow-y-auto lg:overflow-hidden">
          <div ref={contentRef} className="min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/projekt" element={<ProjectsView />} />
              <Route path="/projekt/:id" element={<ProjectDetail />} />

              <Route path="/lingvistik" element={<LinguisticsHome />} />
              <Route path="/lingvistik/trana" element={<TranaView />} />
              <Route path="/lingvistik/:lang" element={<LanguageLayout />}>
                <Route index element={<LangIndexRedirect />} />
                <Route path=":tab" element={<TabRenderer />} />
              </Route>

              <Route path="/hp"      element={<HPView />} />
              <Route path="/lasning" element={<LasningView />} />
              <Route path="/engagemang"   element={<EngagemangView />} />
              <Route path="/vardagskarta" element={<VardagskarteView />} />
              <Route path="/planering"    element={<div />} />
            </Routes>
          </div>
        </div>
      )}
    </main>
  )
}
