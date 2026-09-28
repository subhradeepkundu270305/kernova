import { create } from 'zustand'

export interface TerminalTab {
  id: string
  title: string
}

interface TerminalState {
  terminals: TerminalTab[]
  activeTerminalId: string | null

  createTerminal: (cwd?: string) => Promise<string>
  closeTerminal: (id: string) => void
  setActiveTerminal: (id: string) => void
}

let terminalCounter = 1

export const useTerminalStore = create<TerminalState>((set, get) => ({
  terminals: [],
  activeTerminalId: null,

  createTerminal: async (cwd?: string) => {
    const id = `term-${Date.now()}-${terminalCounter}`
    const title = `Terminal ${terminalCounter++}`

    if (window.kernova) {
      await window.kernova.createTerminal({ id, cwd })
    }

    set((state) => ({
      terminals: [...state.terminals, { id, title }],
      activeTerminalId: id,
    }))

    return id
  },

  closeTerminal: (id: string) => {
    if (window.kernova) {
      window.kernova.destroyTerminal(id)
    }

    set((state) => {
      const remaining = state.terminals.filter((t) => t.id !== id)
      let newActive = state.activeTerminalId
      if (state.activeTerminalId === id) {
        newActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null
      }
      return {
        terminals: remaining,
        activeTerminalId: newActive,
      }
    })
  },

  setActiveTerminal: (id: string) => set({ activeTerminalId: id }),
}))
