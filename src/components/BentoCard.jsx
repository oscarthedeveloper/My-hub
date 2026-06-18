import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

/**
 * BentoCard — grundläggande kort för Dashboard-grid
 *
 * Props:
 *   title       string
 *   subtitle    string (valfri)
 *   icon        React-komponent (lucide)
 *   accent      CSS-färg (valfri, t.ex. '#7c72f5')
 *   to          Route-sökväg att navigera till vid klick
 *   children    Kortets innehåll
 *   className   Extra Tailwind-klasser för grid-placering
 */
export default function BentoCard({
  title,
  subtitle,
  icon: Icon,
  accent = '#7c72f5',
  to,
  children,
  className = '',
}) {
  const cardRef = useRef(null)
  const navigate = useNavigate()

  function handleMouseEnter() {
    gsap.to(cardRef.current, {
      scale: 1.015,
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  function handleMouseLeave() {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  function handleClick() {
    if (to) navigate(to)
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        'relative flex flex-col rounded-2xl border border-border bg-surface p-5',
        'transition-shadow duration-200',
        to ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
      style={{ willChange: 'transform' }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-sm text-dim">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: accent + '18', color: accent }}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* Corner glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at top right, ${accent}0a, transparent 60%)`,
        }}
      />
    </div>
  )
}
