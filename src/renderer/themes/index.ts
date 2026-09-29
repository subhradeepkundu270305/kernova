import * as monaco from 'monaco-editor'
import { themeData as midnightData } from './midnight'
import { themeData as auroraData } from './aurora'
import { themeData as emberData } from './ember'
import { themeData as cyberpunkData } from './cyberpunk'
import { themeData as solarisData } from './solaris'
import { themeData as abyssData } from './abyss'
import type { EditorThemeName } from '../../shared/types'

export interface ThemeColors {
  id: EditorThemeName
  name: string
  subtitle: string
  primary: string
  secondary: string
  primaryGlow: string
  palette: string[]
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
    palette: ['#8B5CF6', '#06B6D4', '#F59E0B', '#A78BFA'],
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
    palette: ['#10B981', '#34D399', '#06B6D4', '#A7F3D0'],
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
    palette: ['#F97316', '#EF4444', '#FBBF24', '#F43F5E'],
    bgBase: '#100707',
    bgSurface1: '#180B0B',
    bgSurface2: '#221010',
    bgSurface3: '#311717',
    borderColor: '#3F1F1F',
    textPrimary: '#FFF1F2',
    textSecondary: '#FECDD3',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    subtitle: 'Hot Pink, Cyan & Gold',
    primary: '#EC4899',
    secondary: '#06B6D4',
    primaryGlow: 'rgba(236, 72, 153, 0.35)',
    palette: ['#EC4899', '#06B6D4', '#FACC15', '#22C55E'],
    bgBase: '#0B0819',
    bgSurface1: '#120D24',
    bgSurface2: '#1A1333',
    bgSurface3: '#261C48',
    borderColor: '#382860',
    textPrimary: '#FDF2F8',
    textSecondary: '#F472B6',
  },
  solaris: {
    id: 'solaris',
    name: 'Solaris',
    subtitle: 'Gold, Coral & Violet',
    primary: '#EAB308',
    secondary: '#F43F5E',
    primaryGlow: 'rgba(234, 179, 8, 0.35)',
    palette: ['#EAB308', '#F43F5E', '#8B5CF6', '#10B981'],
    bgBase: '#0C0A07',
    bgSurface1: '#14100B',
    bgSurface2: '#1C1610',
    bgSurface3: '#2A2117',
    borderColor: '#3D3020',
    textPrimary: '#FEFCE8',
    textSecondary: '#FDE047',
  },
  abyss: {
    id: 'abyss',
    name: 'Abyss',
    subtitle: 'Aqua, Azure & Orchid',
    primary: '#00F2FE',
    secondary: '#3B82F6',
    primaryGlow: 'rgba(0, 242, 254, 0.35)',
    palette: ['#00F2FE', '#3B82F6', '#C084FC', '#34D399'],
    bgBase: '#040914',
    bgSurface1: '#071224',
    bgSurface2: '#0D1E3A',
    bgSurface3: '#142C54',
    borderColor: '#1C3B6F',
    textPrimary: '#F0F9FF',
    textSecondary: '#7DD3FC',
  },
}

/** Register custom Monaco themes in an editor instance */
export function registerMonacoThemes(targetMonaco: typeof monaco): void {
  try {
    targetMonaco.editor.defineTheme('midnight', midnightData)
    targetMonaco.editor.defineTheme('aurora', auroraData)
    targetMonaco.editor.defineTheme('ember', emberData)
    targetMonaco.editor.defineTheme('cyberpunk', cyberpunkData)
    targetMonaco.editor.defineTheme('solaris', solarisData)
    targetMonaco.editor.defineTheme('abyss', abyssData)
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
