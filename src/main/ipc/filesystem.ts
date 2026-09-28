/**
 * Filesystem IPC handlers — file and folder CRUD operations.
 * All operations use Node.js fs/promises (async) and return typed results.
 */
import { ipcMain } from 'electron'
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  rename,
  rm,
  stat,
  access,
  copyFile,
} from 'fs/promises'
import { join, basename, dirname } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { FileTreeNode, FileStat } from '../../shared/types'

/** Directories to hide from the file tree by default */
const IGNORED_DIRS = new Set([
  'node_modules',
  '__pycache__',
  '.git',
  'dist',
  'build',
  '.next',
  '.vite',
  'out',
  '.cache',
  '.turbo',
  'coverage',
])

/**
 * Read a directory's immediate children (lazy — does NOT recurse).
 * Returns sorted FileTreeNode[]: directories first, then files, both alphabetical.
 */
async function readDirHandler(
  _event: Electron.IpcMainInvokeEvent,
  dirPath: string
): Promise<FileTreeNode[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    const nodes: FileTreeNode[] = entries
      .filter((entry) => {
        // Skip hidden files/folders (starting with .) and ignored directories
        if (entry.name.startsWith('.')) return false
        if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) return false
        return true
      })
      .map((entry) => ({
        name: entry.name,
        path: join(dirPath, entry.name),
        type: entry.isDirectory() ? ('directory' as const) : ('file' as const),
        // Directories get an empty children array (loaded lazily on expand)
        ...(entry.isDirectory() ? { children: [] } : {}),
      }))

    // Sort: directories first, then files, alphabetical within each group
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    })

    return nodes
  } catch (err) {
    console.error(`[FS] readDir failed for ${dirPath}:`, err)
    return []
  }
}

/** Read a file's contents as UTF-8 string */
async function readFileHandler(
  _event: Electron.IpcMainInvokeEvent,
  filePath: string
): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch (err: any) {
    throw new Error(`Failed to read file: ${err.message}`)
  }
}

/** Write content to a file, creating parent directories if needed */
async function writeFileHandler(
  _event: Electron.IpcMainInvokeEvent,
  filePath: string,
  content: string
): Promise<void> {
  try {
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, content, 'utf-8')
  } catch (err: any) {
    throw new Error(`Failed to write file: ${err.message}`)
  }
}

/** Create a new file. Errors if the file already exists. */
async function createFileHandler(
  _event: Electron.IpcMainInvokeEvent,
  filePath: string,
  content: string = ''
): Promise<void> {
  try {
    // Check if file already exists
    try {
      await access(filePath)
      throw new Error(`File already exists: ${filePath}`)
    } catch {
      // File doesn't exist — good, create it
    }
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, content, 'utf-8')
  } catch (err: any) {
    throw new Error(`Failed to create file: ${err.message}`)
  }
}

/** Create a new directory (recursive) */
async function createFolderHandler(
  _event: Electron.IpcMainInvokeEvent,
  dirPath: string
): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (err: any) {
    throw new Error(`Failed to create folder: ${err.message}`)
  }
}

/** Rename a file or folder */
async function renameHandler(
  _event: Electron.IpcMainInvokeEvent,
  oldPath: string,
  newPath: string
): Promise<void> {
  try {
    await rename(oldPath, newPath)
  } catch (err: any) {
    throw new Error(`Failed to rename: ${err.message}`)
  }
}

/** Delete a file or folder (recursive) */
async function deleteHandler(_event: Electron.IpcMainInvokeEvent, itemPath: string): Promise<void> {
  try {
    await rm(itemPath, { recursive: true, force: true })
  } catch (err: any) {
    throw new Error(`Failed to delete: ${err.message}`)
  }
}

/** Move a file or folder. Falls back to copy+delete for cross-device moves. */
async function moveHandler(
  _event: Electron.IpcMainInvokeEvent,
  srcPath: string,
  destPath: string
): Promise<void> {
  try {
    await rename(srcPath, destPath)
  } catch (err: any) {
    // Cross-device move: copy then delete
    if (err.code === 'EXDEV') {
      const srcStat = await stat(srcPath)
      if (srcStat.isFile()) {
        await copyFile(srcPath, destPath)
        await rm(srcPath)
      } else {
        throw new Error('Cross-device directory moves are not supported yet')
      }
    } else {
      throw new Error(`Failed to move: ${err.message}`)
    }
  }
}

/** Get file/folder stats */
async function statHandler(
  _event: Electron.IpcMainInvokeEvent,
  itemPath: string
): Promise<FileStat> {
  try {
    const s = await stat(itemPath)
    return {
      name: basename(itemPath),
      path: itemPath,
      type: s.isDirectory() ? 'directory' : 'file',
      size: s.size,
      modifiedAt: s.mtimeMs,
    }
  } catch (err: any) {
    throw new Error(`Failed to stat: ${err.message}`)
  }
}

/** Check if a path exists */
async function existsHandler(
  _event: Electron.IpcMainInvokeEvent,
  itemPath: string
): Promise<boolean> {
  try {
    await access(itemPath)
    return true
  } catch {
    return false
  }
}

/** Register all filesystem IPC handlers */
export function registerFilesystemHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FS_READ_DIR, readDirHandler)
  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, readFileHandler)
  ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, writeFileHandler)
  ipcMain.handle(IPC_CHANNELS.FS_CREATE_FILE, createFileHandler)
  ipcMain.handle(IPC_CHANNELS.FS_CREATE_FOLDER, createFolderHandler)
  ipcMain.handle(IPC_CHANNELS.FS_RENAME, renameHandler)
  ipcMain.handle(IPC_CHANNELS.FS_DELETE, deleteHandler)
  ipcMain.handle(IPC_CHANNELS.FS_MOVE, moveHandler)
  ipcMain.handle(IPC_CHANNELS.FS_STAT, statHandler)
  ipcMain.handle(IPC_CHANNELS.FS_EXISTS, existsHandler)
}
