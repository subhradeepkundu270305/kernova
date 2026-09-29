import { create } from 'zustand'

export interface DiffModalData {
  originalCode: string
  modifiedCode: string
  fileName: string
  language: string
  onAccept: () => void
}

export interface UIState {
  isSidebarOpen: boolean
  sidebarTab: 'files' | 'search'
  isTerminalOpen: boolean
  isAIChatOpen: boolean
  isFocusMode: boolean
  isSplitActive: boolean
  isCommandPaletteOpen: boolean
  commandPaletteMode: 'commands' | 'files'
  isAISettingsOpen: boolean
  isGeneralSettingsOpen: boolean
  isScaffoldModalOpen: boolean
  diffModalData: DiffModalData | null
  sidebarWidth: number
  terminalHeight: number
  aiChatWidth: number

  toggleSidebar: () => void
  setSidebarTab: (tab: 'files' | 'search') => void
  toggleTerminal: () => void
  toggleAIChat: () => void
  openAIChat: () => void
  closeAIChat: () => void
  toggleSplit: () => void
  toggleFocusMode: () => void
  openCommandPalette: (mode?: 'commands' | 'files') => void
  closeCommandPalette: () => void
  openAISettings: () => void
  closeAISettings: () => void
  openGeneralSettings: () => void
  closeGeneralSettings: () => void
  openScaffoldModal: () => void
  closeScaffoldModal: () => void
  openDiffModal: (data: DiffModalData) => void
  closeDiffModal: () => void
  setSidebarWidth: (width: number) => void
  setTerminalHeight: (height: number) => void
  setAIChatWidth: (width: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  sidebarTab: 'files',
  isTerminalOpen: false,
  isAIChatOpen: false,
  isFocusMode: false,
  isSplitActive: false,
  isCommandPaletteOpen: false,
  commandPaletteMode: 'commands',
  isAISettingsOpen: false,
  isGeneralSettingsOpen: false,
  isScaffoldModalOpen: false,
  diffModalData: null,
  sidebarWidth: 280,
  terminalHeight: 220,
  aiChatWidth: 360,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarTab: (sidebarTab) => set({ sidebarTab, isSidebarOpen: true }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  toggleAIChat: () => set((state) => ({ isAIChatOpen: !state.isAIChatOpen })),
  openAIChat: () => set({ isAIChatOpen: true }),
  closeAIChat: () => set({ isAIChatOpen: false }),
  toggleSplit: () => set((state) => ({ isSplitActive: !state.isSplitActive })),
  toggleFocusMode: () =>
    set((state) => ({
      isFocusMode: !state.isFocusMode,
      isSidebarOpen: state.isFocusMode,
      isAIChatOpen: false,
      isTerminalOpen: false,
    })),
  openCommandPalette: (mode = 'commands') =>
    set({ isCommandPaletteOpen: true, commandPaletteMode: mode }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  openAISettings: () => set({ isAISettingsOpen: true }),
  closeAISettings: () => set({ isAISettingsOpen: false }),
  openGeneralSettings: () => set({ isGeneralSettingsOpen: true }),
  closeGeneralSettings: () => set({ isGeneralSettingsOpen: false }),
  openScaffoldModal: () => set({ isScaffoldModalOpen: true }),
  closeScaffoldModal: () => set({ isScaffoldModalOpen: false }),
  openDiffModal: (data) => set({ diffModalData: data }),
  closeDiffModal: () => set({ diffModalData: null }),

  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  setTerminalHeight: (terminalHeight) => set({ terminalHeight }),
  setAIChatWidth: (aiChatWidth) => set({ aiChatWidth }),
}))
