import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0F',
        'bg-surface-1': '#111118',
        'bg-surface-2': '#16161E',
        'bg-surface-3': '#1E1E2A',
        border: {
          DEFAULT: '#2A2A3A',
        },
        'text-primary': '#E4E4E7',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        'accent-violet': '#8B5CF6',
        'accent-cyan': '#06B6D4',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config
