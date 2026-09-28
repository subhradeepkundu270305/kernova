/**
 * KERNOVA — Electron main process entry point.
 * Creates the BrowserWindow, registers IPC handlers, and manages app lifecycle.
 */
import { app, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import { registerFilesystemHandlers } from './ipc/filesystem'
import { registerDialogHandlers } from './ipc/dialog'
import { registerStoreHandlers } from './ipc/store'
import { registerWatchHandlers, stopWatching } from './services/fileWatcher'
import { registerTerminalHandlers, cleanupTerminals } from './ipc/terminal'
import { registerGitHandlers } from './ipc/git'
import { registerSearchHandlers } from './ipc/search'
import { registerSystemHandlers } from './ipc/system'

// Window position/size persistence
const windowStore = new Store({
  name: 'window-state',
  defaults: {
    windowBounds: { width: 1280, height: 800 },
    windowMaximized: false,
  },
})

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const windowBounds = windowStore.get('windowBounds') as {
    x?: number
    y?: number
    width: number
    height: number
  }
  const windowMaximized = windowStore.get('windowMaximized') as boolean

  mainWindow = new BrowserWindow({
    width: windowBounds.width || 1280,
    height: windowBounds.height || 800,
    x: windowBounds.x,
    y: windowBounds.y,
    minWidth: 1024,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    icon: join(__dirname, '../../assets/icons/icon.png'),
    backgroundColor: '#0A0A0F',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (windowMaximized) {
    mainWindow.maximize()
  }

  // Prevent visual flash on load
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // --- Window bounds persistence (debounced) ---
  let resizeTimeout: NodeJS.Timeout
  const saveBounds = () => {
    if (!mainWindow) return
    const isMax = mainWindow.isMaximized()
    windowStore.set('windowMaximized', isMax)
    if (!isMax) {
      windowStore.set('windowBounds', mainWindow.getBounds())
    }
  }
  const debouncedSaveBounds = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(saveBounds, 250)
  }

  mainWindow.on('resize', debouncedSaveBounds)
  mainWindow.on('move', debouncedSaveBounds)
  mainWindow.on('close', () => {
    saveBounds()
    stopWatching()
    cleanupTerminals()
  })

  // --- Maximize state events for the renderer ---
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_ON_MAXIMIZE_CHANGE, false)
  })

  // --- Content Security Policy ---
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:11434 https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai",
        ],
      },
    })
  })

  // --- Register window-dependent services ---
  registerWatchHandlers(mainWindow)
  registerTerminalHandlers(mainWindow)

  // --- Load UI ---
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- Window control IPC handlers ---
function setupWindowIpc(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })
}

import { registerSecretsHandlers } from './ipc/secrets'

// --- App lifecycle ---
app.whenReady().then(() => {
  setupWindowIpc()
  registerFilesystemHandlers()
  registerDialogHandlers()
  registerStoreHandlers()
  registerGitHandlers()
  registerSearchHandlers()
  registerSystemHandlers()
  registerSecretsHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  cleanupTerminals()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
