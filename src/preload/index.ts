import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import type {
  FileTreeNode,
  FileStat,
  FSWatchEvent,
  SessionState,
  GitStatusResult,
  SearchMatch,
} from '../shared/types'

const api = {
  // === Window controls ===
  minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  onMaximizeChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value)
    ipcRenderer.on(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, handler)
  },

  // === Filesystem ===
  readDir: (dirPath: string): Promise<FileTreeNode[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIR, dirPath),
  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath),
  writeFile: (filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),
  createFile: (filePath: string, content?: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, filePath, content || ''),
  createFolder: (dirPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FOLDER, dirPath),
  renameItem: (oldPath: string, newPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME, oldPath, newPath),
  deleteItem: (itemPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE, itemPath),
  moveItem: (srcPath: string, destPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_MOVE, srcPath, destPath),
  fileStat: (itemPath: string): Promise<FileStat> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_STAT, itemPath),
  fileExists: (itemPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_EXISTS, itemPath),

  // === File watching ===
  watchStart: (dirPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_WATCH_START, dirPath),
  watchStop: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.FS_WATCH_STOP),
  onFSWatchEvent: (callback: (event: FSWatchEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: FSWatchEvent) => callback(data)
    ipcRenderer.on(IPC_CHANNELS.FS_WATCH_EVENT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.FS_WATCH_EVENT, handler)
  },

  // === Dialogs ===
  showOpenFolderDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FOLDER),
  showOpenFileDialog: (): Promise<string[] | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE),
  showSaveFileDialog: (defaultPath?: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, defaultPath),
  showMessageBox: (options: {
    type: string
    title: string
    message: string
    buttons: string[]
  }): Promise<number> => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_MESSAGE_BOX, options),

  // === Store ===
  getSession: (): Promise<SessionState | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_GET_SESSION),
  setSession: (session: SessionState): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_SET_SESSION, session),
  getSetting: (key: string): Promise<unknown> => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key),
  setSetting: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value),

  // === Terminal ===
  createTerminal: (params: {
    id: string
    cwd?: string
    cols?: number
    rows?: number
  }): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, params),
  writeTerminal: (params: { id: string; data: string }): void =>
    ipcRenderer.send(IPC_CHANNELS.TERMINAL_WRITE, params),
  resizeTerminal: (params: { id: string; cols: number; rows: number }): void =>
    ipcRenderer.send(IPC_CHANNELS.TERMINAL_RESIZE, params),
  destroyTerminal: (id: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_DESTROY, id),
  onTerminalData: (callback: (payload: { id: string; data: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { id: string; data: string }) =>
      callback(payload)
    ipcRenderer.on(IPC_CHANNELS.TERMINAL_DATA, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_DATA, handler)
  },
  onTerminalExit: (callback: (payload: { id: string; exitCode: number }) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: { id: string; exitCode: number }
    ) => callback(payload)
    ipcRenderer.on(IPC_CHANNELS.TERMINAL_EXIT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_EXIT, handler)
  },

  // === Git ===
  getGitStatus: (folderPath: string): Promise<GitStatusResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_STATUS, folderPath),

  // === Search ===
  searchProject: (params: {
    folderPath: string
    query: string
    matchCase?: boolean
    isRegex?: boolean
    wholeWord?: boolean
  }): Promise<SearchMatch[]> => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_PROJECT, params),

  // === System ===
  getSystemRAM: (): Promise<{ totalGB: number; totalBytes: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_RAM),
  checkOnline: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_CHECK_ONLINE),

  // === SafeStorage Secrets ===
  setSecretKey: (provider: string, key: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECRETS_SET_KEY, { provider, key }),
  getSecretKey: (provider: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECRETS_GET_KEY, provider),
  hasSecretKey: (provider: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECRETS_HAS_KEY, provider),
  deleteSecretKey: (provider: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECRETS_DELETE_KEY, provider),
}

contextBridge.exposeInMainWorld('kernova', api)
