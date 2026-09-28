import { create } from 'zustand'
import type { SearchMatch } from '../../shared/types'

interface SearchState {
  query: string
  matchCase: boolean
  isRegex: boolean
  wholeWord: boolean
  isSearching: boolean
  results: SearchMatch[]

  setQuery: (query: string) => void
  setMatchCase: (matchCase: boolean) => void
  setIsRegex: (isRegex: boolean) => void
  setWholeWord: (wholeWord: boolean) => void
  performSearch: (folderPath: string) => Promise<void>
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  matchCase: false,
  isRegex: false,
  wholeWord: false,
  isSearching: false,
  results: [],

  setQuery: (query) => set({ query }),
  setMatchCase: (matchCase) => set({ matchCase }),
  setIsRegex: (isRegex) => set({ isRegex }),
  setWholeWord: (wholeWord) => set({ wholeWord }),

  performSearch: async (folderPath: string) => {
    const { query, matchCase, isRegex, wholeWord } = get()
    if (!query.trim() || !folderPath || !window.kernova) {
      set({ results: [], isSearching: false })
      return
    }

    set({ isSearching: true })
    try {
      const results = await window.kernova.searchProject({
        folderPath,
        query,
        matchCase,
        isRegex,
        wholeWord,
      })
      set({ results, isSearching: false })
    } catch {
      set({ results: [], isSearching: false })
    }
  },

  clearSearch: () => set({ query: '', results: [], isSearching: false }),
}))
