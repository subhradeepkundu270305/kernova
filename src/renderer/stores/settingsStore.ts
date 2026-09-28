import { create } from 'zustand'
import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types'

interface SettingsState extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
  resetSettings: () => set({ ...DEFAULT_SETTINGS }),
}))
