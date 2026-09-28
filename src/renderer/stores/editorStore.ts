import { create } from 'zustand'
import { TabInfo, EXTENSION_TO_LANGUAGE } from '../../shared/types'

interface EditorState {
  tabs: TabInfo[]
  activeTabId: string | null
  splitActiveTabId: string | null
  fileContents: Record<string, string> // filePath -> content

  openFile: (filePath: string) => Promise<void>
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeAllTabs: () => void
  setActiveTab: (tabId: string) => void
  setSplitActiveTab: (tabId: string) => void
  updateFileContent: (tabId: string, content: string) => void
  markSaved: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  pinTab: (tabId: string) => void
  unpinTab: (tabId: string) => void
  updateCursorPosition: (tabId: string, position: { lineNumber: number; column: number }) => void
  updateScrollPosition: (tabId: string, position: { top: number; left: number }) => void
}

const getLanguageFromPath = (filePath: string) => {
  const ext = filePath.substring(filePath.lastIndexOf('.'))
  return EXTENSION_TO_LANGUAGE[ext] || 'plaintext'
}

const getFileName = (filePath: string) => {
  const parts = filePath.split(/[/\\]/)
  return parts[parts.length - 1]
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  splitActiveTabId: null,
  fileContents: {},

  openFile: async (filePath: string) => {
    const state = get()
    const existingTab = state.tabs.find((t) => t.filePath === filePath)

    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }

    try {
      const content = await window.kernova.readFile(filePath)
      const newTab: TabInfo = {
        id: filePath,
        filePath,
        fileName: getFileName(filePath),
        language: getLanguageFromPath(filePath),
        isDirty: false,
        isPinned: false,
      }

      set((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        splitActiveTabId: state.splitActiveTabId || newTab.id,
        fileContents: { ...state.fileContents, [newTab.id]: content },
      }))
    } catch (error) {
      console.error('Failed to open file:', error)
      window.kernova.showMessageBox({
        type: 'error',
        title: 'Error',
        message: `Failed to open file: ${error instanceof Error ? error.message : String(error)}`,
        buttons: ['OK'],
      })
    }
  },

  closeTab: (tabId: string) => {
    const state = get()
    const tabIndex = state.tabs.findIndex((t) => t.id === tabId)
    if (tabIndex === -1) return

    const newTabs = state.tabs.filter((t) => t.id !== tabId)
    let newActiveTabId = state.activeTabId
    let newSplitActiveTabId = state.splitActiveTabId

    if (state.activeTabId === tabId) {
      if (newTabs.length > 0) {
        const nextIndex = Math.min(tabIndex, newTabs.length - 1)
        newActiveTabId = newTabs[nextIndex].id
      } else {
        newActiveTabId = null
      }
    }

    if (state.splitActiveTabId === tabId) {
      newSplitActiveTabId = newActiveTabId
    }

    const newFileContents = { ...state.fileContents }
    delete newFileContents[tabId]

    set({
      tabs: newTabs,
      activeTabId: newActiveTabId,
      splitActiveTabId: newSplitActiveTabId,
      fileContents: newFileContents,
    })
  },

  closeOtherTabs: (tabId: string) => {
    const state = get()
    const targetTab = state.tabs.find((t) => t.id === tabId)
    if (!targetTab) return

    const newTabs = state.tabs.filter((t) => t.id === tabId || t.isPinned || t.isDirty)
    const newFileContents: Record<string, string> = {}
    newTabs.forEach((t) => {
      if (state.fileContents[t.id] !== undefined) {
        newFileContents[t.id] = state.fileContents[t.id]
      }
    })

    set({
      tabs: newTabs,
      activeTabId: tabId,
      splitActiveTabId: tabId,
      fileContents: newFileContents,
    })
  },

  closeAllTabs: () => {
    const state = get()
    const retainedTabs = state.tabs.filter((t) => t.isPinned || t.isDirty)
    const newFileContents: Record<string, string> = {}

    let newActiveTabId = state.activeTabId
    if (!retainedTabs.find((t) => t.id === newActiveTabId)) {
      newActiveTabId = retainedTabs.length > 0 ? retainedTabs[0].id : null
    }

    retainedTabs.forEach((t) => {
      if (state.fileContents[t.id] !== undefined) {
        newFileContents[t.id] = state.fileContents[t.id]
      }
    })

    set({
      tabs: retainedTabs,
      activeTabId: newActiveTabId,
      splitActiveTabId: newActiveTabId,
      fileContents: newFileContents,
    })
  },

  setActiveTab: (tabId: string) => set({ activeTabId: tabId }),
  setSplitActiveTab: (tabId: string) => set({ splitActiveTabId: tabId }),

  updateFileContent: (tabId: string, content: string) => {
    set((state) => ({
      fileContents: { ...state.fileContents, [tabId]: content },
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty: true } : t)),
    }))
  },

  markSaved: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)),
    }))
  },

  reorderTabs: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newTabs = [...state.tabs]
      const [movedTab] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, movedTab)
      return { tabs: newTabs }
    })
  },

  pinTab: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isPinned: true } : t)),
    }))
  },

  unpinTab: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isPinned: false } : t)),
    }))
  },

  updateCursorPosition: (tabId: string, position: { lineNumber: number; column: number }) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, cursorPosition: position } : t)),
    }))
  },

  updateScrollPosition: (tabId: string, position: { top: number; left: number }) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, scrollPosition: position } : t)),
    }))
  },
}))
