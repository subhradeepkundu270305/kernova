/// <reference types="vite/client" />

import type {
  FileTreeNode,
  FileStat,
  FSWatchEvent,
  SessionState,
  GitStatusResult,
  SearchMatch,
} from '../shared/types'

interface KernovaAPI {
  // Window
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void

  // Filesystem
  readDir: (dirPath: string) => Promise<FileTreeNode[]>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<void>
  createFile: (filePath: string, content?: string) => Promise<void>
  createFolder: (dirPath: string) => Promise<void>
  renameItem: (oldPath: string, newPath: string) => Promise<void>
  deleteItem: (itemPath: string) => Promise<void>
  moveItem: (srcPath: string, destPath: string) => Promise<void>
  fileStat: (itemPath: string) => Promise<FileStat>
  fileExists: (itemPath: string) => Promise<boolean>

  // File watching
  watchStart: (dirPath: string) => Promise<void>
  watchStop: () => Promise<void>
  onFSWatchEvent: (callback: (event: FSWatchEvent) => void) => () => void

  // Dialogs
  showOpenFolderDialog: () => Promise<string | null>
  showOpenFileDialog: () => Promise<string[] | null>
  showSaveFileDialog: (defaultPath?: string) => Promise<string | null>
  showMessageBox: (options: {
    type: string
    title: string
    message: string
    buttons: string[]
  }) => Promise<number>

  // Store
  getSession: () => Promise<SessionState | null>
  setSession: (session: SessionState) => Promise<void>
  getSetting: (key: string) => Promise<unknown>
  setSetting: (key: string, value: unknown) => Promise<void>

  // Terminal
  createTerminal: (params: {
    id: string
    cwd?: string
    cols?: number
    rows?: number
  }) => Promise<{ success: boolean; error?: string }>
  writeTerminal: (params: { id: string; data: string }) => void
  resizeTerminal: (params: { id: string; cols: number; rows: number }) => void
  destroyTerminal: (id: string) => Promise<boolean>
  onTerminalData: (callback: (payload: { id: string; data: string }) => void) => () => void
  onTerminalExit: (callback: (payload: { id: string; exitCode: number }) => void) => () => void

  // Git
  getGitStatus: (folderPath: string) => Promise<GitStatusResult>

  // Search
  searchProject: (params: {
    folderPath: string
    query: string
    matchCase?: boolean
    isRegex?: boolean
    wholeWord?: boolean
  }) => Promise<SearchMatch[]>

  // System
  getSystemRAM: () => Promise<{ totalGB: number; totalBytes: number }>
  checkOnline: () => Promise<boolean>

  // SafeStorage Secrets
  setSecretKey: (provider: string, key: string) => Promise<{ success: boolean; error?: string }>
  getSecretKey: (provider: string) => Promise<string | null>
  hasSecretKey: (provider: string) => Promise<boolean>
  deleteSecretKey: (provider: string) => Promise<boolean>
}

declare global {
  interface Window {
    kernova: KernovaAPI
  }
}
