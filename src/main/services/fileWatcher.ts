/**
 * File watcher service — watches a project directory for changes using chokidar.
 * Sends debounced events to the renderer via IPC.
 */
import { ipcMain, type BrowserWindow } from 'electron'
import { watch, type FSWatcher } from 'chokidar'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { FSWatchEvent } from '../../shared/types'

let watcher: FSWatcher | null = null

/** Patterns to ignore when watching */
const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/__pycache__/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.vite/**',
  '**/out/**',
  '**/.cache/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/.*', // hidden files
]

/**
 * Start watching a directory for file changes.
 * Events are debounced (100ms) and sent to the renderer.
 */
export function startWatching(dirPath: string, webContents: Electron.WebContents): void {
  // Stop any existing watcher first
  stopWatching()

  // Debounce buffer: collect events and flush periodically
  let eventBuffer: FSWatchEvent[] = []
  let flushTimeout: NodeJS.Timeout | null = null

  const flush = () => {
    if (eventBuffer.length > 0 && !webContents.isDestroyed()) {
      // Send each event individually so the renderer can handle them
      for (const event of eventBuffer) {
        webContents.send(IPC_CHANNELS.FS_WATCH_EVENT, event)
      }
      eventBuffer = []
    }
    flushTimeout = null
  }

  const enqueue = (event: FSWatchEvent) => {
    eventBuffer.push(event)
    if (!flushTimeout) {
      flushTimeout = setTimeout(flush, 100) // 100ms debounce
    }
  }

  watcher = watch(dirPath, {
    ignored: IGNORED_PATTERNS,
    persistent: true,
    ignoreInitial: true, // Don't emit events for existing files on startup
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 50,
    },
  })

  watcher
    .on('add', (path) => enqueue({ type: 'add', path }))
    .on('change', (path) => enqueue({ type: 'change', path }))
    .on('unlink', (path) => enqueue({ type: 'unlink', path }))
    .on('addDir', (path) => enqueue({ type: 'addDir', path }))
    .on('unlinkDir', (path) => enqueue({ type: 'unlinkDir', path }))
    .on('error', (err) => console.error('[Watcher] Error:', err))

  console.log(`[Watcher] Watching: ${dirPath}`)
}

/** Stop the current file watcher */
export function stopWatching(): void {
  if (watcher) {
    watcher.close()
    watcher = null
    console.log('[Watcher] Stopped')
  }
}

/** Register file watcher IPC handlers */
export function registerWatchHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNELS.FS_WATCH_START, (_event, dirPath: string) => {
    startWatching(dirPath, mainWindow.webContents)
  })

  ipcMain.handle(IPC_CHANNELS.FS_WATCH_STOP, () => {
    stopWatching()
  })
}
