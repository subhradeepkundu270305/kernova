import * as monaco from 'monaco-editor'
import { themeData as midnightData } from './midnight'
import { themeData as auroraData } from './aurora'
import { themeData as emberData } from './ember'
import type { EditorThemeName } from '../../shared/types'

export interface ThemeColors {
  id: EditorThemeName
  name: string
  subtitle: string
  primary: string
  secondary: string
  primaryGlow: string
  bgBase: string
  bgSurface1: string
  bgSurface2: string
  bgSurface3: string
  borderColor: string
  textPrimary: string
  textSecondary: string
}

export const THEMES: Record<EditorThemeName, ThemeColors> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight (Default)',
    subtitle: 'Violet & Cyan Neon',
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    primaryGlow: 'rgba(139, 92, 246, 0.35)',
    bgBase: '#0A0A0F',
    bgSurface1: '#111118',
    bgSurface2: '#16161E',
    bgSurface3: '#1E1E2A',
    borderColor: '#2A2A3A',
    textPrimary: '#E4E4E7',
    textSecondary: '#A1A1AA',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    subtitle: 'Emerald & Mint Glow',
    primary: '#10B981',
    secondary: '#34D399',
    primaryGlow: 'rgba(16, 185, 129, 0.35)',
    bgBase: '#07100C',
    bgSurface1: '#0B1713',
    bgSurface2: '#10221C',
    bgSurface3: '#173027',
    borderColor: '#1C3D2F',
    textPrimary: '#ECFDF5',
    textSecondary: '#A7F3D0',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    subtitle: 'Warm Amber & Crimson',
    primary: '#F97316',
    secondary: '#EF4444',
    primaryGlow: 'rgba(249, 115, 22, 0.35)',
    bgBase: '#100707',
    bgSurface1: '#180B0B',
    bgSurface2: '#221010',
    bgSurface3: '#311717',
    borderColor: '#3F1F1F',
    textPrimary: '#FFF1F2',
    textSecondary: '#FECDD3',
  },
}

/** Register custom Monaco themes in an editor instance */
export function registerMonacoThemes(targetMonaco: typeof monaco): void {
  try {
    targetMonaco.editor.defineTheme('midnight', midnightData)
    targetMonaco.editor.defineTheme('aurora', auroraData)
    targetMonaco.editor.defineTheme('ember', emberData)
  } catch (err) {
    console.error('Failed to register Monaco themes:', err)
  }
}

/** Apply full application UI color scheme and set Monaco editor theme */
export function applyAppTheme(themeName: EditorThemeName): void {
  const theme = THEMES[themeName] || THEMES.midnight
  const root = document.documentElement

  root.setAttribute('data-theme', themeName)
  root.style.setProperty('--color-primary', theme.primary)
  root.style.setProperty('--color-secondary', theme.secondary)
  root.style.setProperty('--color-primary-glow', theme.primaryGlow)
  root.style.setProperty('--bg-base', theme.bgBase)
  root.style.setProperty('--bg-surface-1', theme.bgSurface1)
  root.style.setProperty('--bg-surface-2', theme.bgSurface2)
  root.style.setProperty('--bg-surface-3', theme.bgSurface3)
  root.style.setProperty('--border-color', theme.borderColor)

  // Switch Monaco editor theme
  try {
    monaco.editor.setTheme(themeName)
  } catch (e) {
    // In case editor hasn't loaded yet
  }
}
