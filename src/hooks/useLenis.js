import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Attach Lenis smooth scroll to a specific container.
 * @param {React.RefObject} wrapperRef  — the clipping viewport (overflow: hidden)
 * @param {React.RefObject} contentRef  — the inner element Lenis translates
 */
export default function useLenis(wrapperRef, contentRef) {
  useEffect(() => {
    // Mobil/surfplatta under lg (1024px) — native scroll sköter det
    if (window.matchMedia('(max-width: 1023px)').matches) return

    const wrapper = wrapperRef?.current
    const content = contentRef?.current
    if (!wrapper || !content) return

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
