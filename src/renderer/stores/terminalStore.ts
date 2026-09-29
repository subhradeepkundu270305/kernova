import { create } from 'zustand'

export interface TerminalTab {
  id: string
  title: string
  exited?: boolean
  exitCode?: number
}

interface TerminalState {
  terminals: TerminalTab[]
  activeTerminalId: string | null
  isCreating: boolean

  createTerminal: (cwd?: string) => Promise<string | null>
  closeTerminal: (id: string) => void
  markTerminalExited: (id: string, exitCode?: number) => void
  setActiveTerminal: (id: string) => void
}

let terminalCounter = 1

export const useTerminalStore = create<TerminalState>((set, get) => ({
  terminals: [],
  activeTerminalId: null,
  isCreating: false,

  createTerminal: async (cwd?: string) => {
    if (get().isCreating) return null
    set({ isCreating: true })

    const id = `term-${Date.now()}-${terminalCounter}`
    const title = `Terminal ${terminalCounter++}`

    try {
      if (window.kernova) {
        const res = await window.kernova.createTerminal({ id, cwd })
        if (res && res.success === false) {
          console.error('Failed to create terminal:', res.error)
          return null
        }
      }

      set((state) => ({
        terminals: [...state.terminals, { id, title, exited: false }],
        activeTerminalId: id,
      }))

      return id
    } catch (err) {
      console.error('Error creating terminal:', err)
      return null
    } finally {
      set({ isCreating: false })
    }
  },

  markTerminalExited: (id: string, exitCode?: number) => {
    set((state) => ({
      terminals: state.terminals.map((t) =>
        t.id === id ? { ...t, exited: true, exitCode } : t
      ),
    }))
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
