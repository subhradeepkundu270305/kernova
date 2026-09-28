import { create } from 'zustand'
import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types'
import { applyAppTheme } from '../themes'

interface SettingsState extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => {
    set((state) => ({ ...state, [key]: value }))
    window.kernova?.setSetting(key as string, value)

    if (key === 'editorTheme') {
      applyAppTheme(value as any)
    }
  },

  resetSettings: () => {
    set({ ...DEFAULT_SETTINGS })
    applyAppTheme(DEFAULT_SETTINGS.editorTheme)
  },

  loadSettings: async () => {
    if (!window.kernova) {
      applyAppTheme(DEFAULT_SETTINGS.editorTheme)
      return
    }

    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]
    const loaded: Partial<AppSettings> = {}

    for (const key of keys) {
      try {
        const val = await window.kernova.getSetting(key as string)
        if (val !== undefined && val !== null) {
          loaded[key] = val as any
        }
      } catch {
        // Fallback to default
      }
    }

    if (Object.keys(loaded).length > 0) {
      set((state) => ({ ...state, ...loaded }))
    }

    const themeToApply = loaded.editorTheme || get().editorTheme
    applyAppTheme(themeToApply)
  },
}))
