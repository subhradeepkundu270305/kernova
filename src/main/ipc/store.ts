/**
 * Store IPC handlers — settings and session persistence via electron-store.
 * Uses two separate stores: one for user settings, one for session state.
 */
import { ipcMain } from 'electron'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { SessionState } from '../../shared/types'

// Settings store (user preferences like theme, font, etc.)
const settingsStore = new Store({
  name: 'settings',
  defaults: {},
})

// Session store (transient state: open folder, tabs, active tab)
const sessionStore = new Store<{ session: SessionState | null }>({
  name: 'session',
  defaults: {
    session: null,
  },
})

/** Register all store IPC handlers */
export function registerStoreHandlers(): void {
  // Get a single setting value by key
  ipcMain.handle(IPC_CHANNELS.STORE_GET, (_event, key: string) => {
    return settingsStore.get(key)
  })

  // Set a single setting value by key
  ipcMain.handle(IPC_CHANNELS.STORE_SET, (_event, key: string, value: unknown) => {
    settingsStore.set(key, value)
  })

  // Get the saved session state (for restore on relaunch)
  ipcMain.handle(IPC_CHANNELS.STORE_GET_SESSION, () => {
    return sessionStore.get('session') || null
  })

  // Save session state (called before window closes)
  ipcMain.handle(IPC_CHANNELS.STORE_SET_SESSION, (_event, session: SessionState) => {
    sessionStore.set('session', session)
  })
}
