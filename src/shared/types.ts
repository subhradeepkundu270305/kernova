/** Editor theme names */
export type EditorThemeName = 'midnight' | 'aurora' | 'ember'

/** Font family options */
export type FontFamily = 'JetBrains Mono' | 'Fira Code'

/** App settings persisted to disk */
export interface AppSettings {
  // Appearance
  editorTheme: EditorThemeName
  fontFamily: FontFamily
  fontSize: number
  fontLigatures: boolean
  reduceEffects: boolean
  // Editor
  autoSave: boolean
  autoSaveDelay: number // ms
  minimap: boolean
  wordWrap: 'on' | 'off' | 'wordWrapColumn'
  // Window (internal, not shown in settings UI)
  windowBounds?: { x: number; y: number; width: number; height: number }
  windowMaximized?: boolean
}

/** Default settings */
export const DEFAULT_SETTINGS: AppSettings = {
  editorTheme: 'midnight',
  fontFamily: 'JetBrains Mono',
  fontSize: 14,
  fontLigatures: true,
  reduceEffects: false,
  autoSave: true,
  autoSaveDelay: 1000,
  minimap: true,
  wordWrap: 'off',
}

/** Represents a file or folder in the tree */
export interface FileTreeNode {
  name: string
  path: string // absolute path
  type: 'file' | 'directory'
  children?: FileTreeNode[]
  isExpanded?: boolean
  isLoading?: boolean
}

/** Information about an open tab */
export interface TabInfo {
  id: string // unique ID (use file path as ID for file tabs)
  filePath: string // absolute path
  fileName: string // basename
  language: string // Monaco language ID
  isDirty: boolean // has unsaved changes
  isPinned: boolean
  scrollPosition?: { top: number; left: number }
  cursorPosition?: { lineNumber: number; column: number }
}

/** Session state to restore on relaunch */
export interface SessionState {
  openFolderPath: string | null
  openTabs: TabInfo[]
  activeTabId: string | null
  sidebarWidth: number
  sidebarOpen: boolean
  splitActive?: boolean
  splitActiveTabId?: string | null
  terminalOpen?: boolean
  terminalHeight?: number
}

/** File system event from the watcher */
export interface FSWatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir'
  path: string
}

/** File stat result */
export interface FileStat {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: number
}

/** Git repository status */
export interface GitStatusResult {
  isRepo: boolean
  branch: string
  isClean: boolean
  modified: string[]
  not_added: string[]
  staged: string[]
}

/** Project search match */
export interface SearchMatch {
  filePath: string
  relativeFilePath: string
  lineNumber: number
  lineContent: string
  matchIndex: number
  matchLength: number
}

/** Language detection map for common file extensions */
export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.py': 'python',
  '.pyw': 'python',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',
  '.jsonc': 'jsonc',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.svg': 'xml',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.sql': 'sql',
  '.dockerfile': 'dockerfile',
  '.toml': 'toml',
  '.ini': 'ini',
  '.lua': 'lua',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.dart': 'dart',
  '.r': 'r',
  '.cs': 'csharp',
  '.fs': 'fsharp',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.vue': 'html',
  '.graphql': 'graphql',
  '.gql': 'graphql',
}
