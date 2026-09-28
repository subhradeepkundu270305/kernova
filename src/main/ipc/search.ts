/**
 * Project Search IPC handlers — scans files in folder for search matches
 */
import { ipcMain } from 'electron'
import { readdir, readFile, stat } from 'fs/promises'
import { join, relative } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { SearchMatch } from '../../shared/types'

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '__pycache__',
  'dist',
  'build',
  '.next',
  '.vite',
  'out',
  '.cache',
  '.turbo',
  'coverage',
])

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB limit for search
const MAX_TOTAL_MATCHES = 500

async function findFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await findFiles(fullPath, fileList)
        }
      } else if (entry.isFile()) {
        fileList.push(fullPath)
      }
    }
  } catch {}
  return fileList
}

export function registerSearchHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_PROJECT,
    async (
      _event,
      {
        folderPath,
        query,
        matchCase,
        isRegex,
        wholeWord,
      }: {
        folderPath: string
        query: string
        matchCase?: boolean
        isRegex?: boolean
        wholeWord?: boolean
      }
    ): Promise<SearchMatch[]> => {
      if (!query || !folderPath) return []

      const files = await findFiles(folderPath)
      const matches: SearchMatch[] = []

      let regex: RegExp
      try {
        let pattern = query
        if (!isRegex) {
          pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
        regex = new RegExp(pattern, matchCase ? 'g' : 'gi')
      } catch {
        return []
      }

      for (const file of files) {
        if (matches.length >= MAX_TOTAL_MATCHES) break

        try {
          const s = await stat(file)
          if (s.size > MAX_FILE_SIZE) continue

          const content = await readFile(file, 'utf-8')
          const lines = content.split('\n')

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            regex.lastIndex = 0
            let match: RegExpExecArray | null

            while ((match = regex.exec(line)) !== null) {
              matches.push({
                filePath: file,
                relativeFilePath: relative(folderPath, file),
                lineNumber: i + 1,
                lineContent: line.trim(),
                matchIndex: match.index,
                matchLength: match[0].length,
              })

              if (matches.length >= MAX_TOTAL_MATCHES) break
              if (!regex.global) break
            }
          }
        } catch {
          // Skip unreadable / binary files
        }
      }

      return matches
    }
  )
}
