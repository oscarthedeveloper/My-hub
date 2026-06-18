import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Animate element in on mount.
 * @param {object} fromVars  - gsap fromTo "from" vars
 * @param {object} toVars    - gsap fromTo "to" vars (merged with defaults)
 */
export function useFadeIn(fromVars = {}, toVars = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 16, ...fromVars },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', ...toVars }
    )
  }, [])

  return ref
}

/**
 * Staggered fade-in for a list of children.
 */
export function useStaggerIn(stagger = 0.07) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const children = ref.current.children
    gsap.fromTo(
      children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger }
    )
  }, [stagger])

  return ref
}
