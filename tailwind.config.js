/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-sensitive — driven by CSS variables (see index.css)
        bg:       'rgb(var(--color-bg)       / <alpha-value>)',
        surface:  'rgb(var(--color-surface)  / <alpha-value>)',
        surface2: 'rgb(var(--color-surface2) / <alpha-value>)',
        border:   'rgb(var(--color-border)   / <alpha-value>)',
        border2:  'rgb(var(--color-border2)  / <alpha-value>)',
        text:     'rgb(var(--color-text)     / <alpha-value>)',
        muted:    'rgb(var(--color-muted)    / <alpha-value>)',
        dim:      'rgb(var(--color-dim)      / <alpha-value>)',
        // Fixed accent colours — same in both modes
        accent: '#7c72f5',
        cyan:   '#0891b2',
        green:  '#059669',
        amber:  '#d97706',
        rose:   '#e11d48',
      },
      fontFamily: {
        sans:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
