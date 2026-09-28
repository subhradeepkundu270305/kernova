/**
 * Git IPC handlers — interacts with system Git using simple-git
 */
import { ipcMain } from 'electron'
import simpleGit from 'simple-git'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { GitStatusResult } from '../../shared/types'

export function registerGitHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.GIT_GET_STATUS,
    async (_event, folderPath: string): Promise<GitStatusResult> => {
      try {
        const git = simpleGit(folderPath)
        const isRepo = await git.checkIsRepo()
        if (!isRepo) {
          return {
            isRepo: false,
            branch: '',
            isClean: true,
            modified: [],
            not_added: [],
            staged: [],
          }
        }

        const status = await git.status()
        return {
          isRepo: true,
          branch: status.current || 'HEAD',
          isClean: status.isClean(),
          modified: status.modified,
          not_added: status.not_added,
          staged: status.staged,
        }
      } catch (err) {
        return {
          isRepo: false,
          branch: '',
          isClean: true,
          modified: [],
          not_added: [],
          staged: [],
        }
      }
    }
  )
}
