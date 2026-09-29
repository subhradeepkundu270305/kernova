/**
 * Terminal IPC handlers — spawns shells using node-pty and bridges to xterm.js
 */
import { ipcMain, type BrowserWindow } from 'electron'
import * as pty from 'node-pty'
import * as fs from 'fs'
import * as os from 'os'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

interface TerminalSession {
  id: string
  ptyProcess: pty.IPty
}

const activeTerminals = new Map<string, TerminalSession>()

/** Get default shell for current platform */
function getDefaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || '/bin/bash'
}

/** Resolve a guaranteed valid directory for terminal execution */
function resolveSafeCwd(cwd?: string): string {
  if (cwd && typeof cwd === 'string' && cwd.trim().length > 0) {
    try {
      if (fs.existsSync(cwd) && fs.statSync(cwd).isDirectory()) {
        return cwd
      }
    } catch {}
  }

  try {
    const home = os.homedir()
    if (home && fs.existsSync(home) && fs.statSync(home).isDirectory()) {
      return home
    }
  } catch {}

  if (process.env.HOME) {
    try {
      if (fs.existsSync(process.env.HOME) && fs.statSync(process.env.HOME).isDirectory()) {
        return process.env.HOME
      }
    } catch {}
  }

  return os.tmpdir() || '/tmp'
}

/** Get a clean environment for child shell sessions (avoids AppImage LD_LIBRARY_PATH pollution) */
function getCleanEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) }

  if (process.env.APPDIR && env.LD_LIBRARY_PATH) {
    const cleaned = env.LD_LIBRARY_PATH.split(':')
      .filter((p) => !p.startsWith(process.env.APPDIR!))
      .join(':')
    if (cleaned.length > 0) {
      env.LD_LIBRARY_PATH = cleaned
    } else {
      delete env.LD_LIBRARY_PATH
    }
  }

  env.TERM = 'xterm-256color'
  env.COLORTERM = 'truecolor'
  return env
}

export function registerTerminalHandlers(mainWindow: BrowserWindow): void {
  // Create a new PTY session
  ipcMain.handle(
    IPC_CHANNELS.TERMINAL_CREATE,
    (
      _event,
      { id, cwd, cols, rows }: { id: string; cwd?: string; cols?: number; rows?: number }
    ) => {
      try {
        // Destroy existing session with same ID if any
        if (activeTerminals.has(id)) {
          try {
            activeTerminals.get(id)?.ptyProcess.kill()
          } catch {}
          activeTerminals.delete(id)
        }

        const shell = getDefaultShell()
        const workingDir = resolveSafeCwd(cwd)
        const env = getCleanEnv()

        const ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-256color',
          cols: cols && cols > 0 ? cols : 80,
          rows: rows && rows > 0 ? rows : 24,
          cwd: workingDir,
          env,
        })

        // Stream data back to renderer
        ptyProcess.onData((data: string) => {
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send(IPC_CHANNELS.TERMINAL_DATA, { id, data })
          }
        })

        // Stream exit back to renderer
        ptyProcess.onExit(({ exitCode, signal }) => {
          activeTerminals.delete(id)
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send(IPC_CHANNELS.TERMINAL_EXIT, { id, exitCode, signal })
          }
        })

        activeTerminals.set(id, { id, ptyProcess })
        return { success: true }
      } catch (err: any) {
        console.error('[Terminal] Failed to spawn PTY:', err)
        return { success: false, error: err.message }
      }
    }
  )

  // Write input to PTY
  ipcMain.on(IPC_CHANNELS.TERMINAL_WRITE, (_event, { id, data }: { id: string; data: string }) => {
    const session = activeTerminals.get(id)
    if (session) {
      try {
        session.ptyProcess.write(data)
      } catch (err) {
        console.error('[Terminal] Write error:', err)
      }
    }
  })

  // Resize PTY
  ipcMain.on(
    IPC_CHANNELS.TERMINAL_RESIZE,
    (_event, { id, cols, rows }: { id: string; cols: number; rows: number }) => {
      const session = activeTerminals.get(id)
      if (session && cols > 0 && rows > 0) {
        try {
          session.ptyProcess.resize(cols, rows)
        } catch (err) {
          console.error('[Terminal] Resize error:', err)
        }
      }
    }
  )

  // Destroy PTY
  ipcMain.handle(IPC_CHANNELS.TERMINAL_DESTROY, (_event, id: string) => {
    const session = activeTerminals.get(id)
    if (session) {
      try {
        session.ptyProcess.kill()
      } catch {}
      activeTerminals.delete(id)
    }
    return true
  })
}

/** Clean up all terminals on app quit */
export function cleanupTerminals(): void {
  for (const session of activeTerminals.values()) {
    try {
      session.ptyProcess.kill()
    } catch {}
  }
  activeTerminals.clear()
}
