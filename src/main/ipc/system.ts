/**
 * System and Network IPC handlers
 */
import { ipcMain } from 'electron'
import { totalmem } from 'os'
import { lookup } from 'dns/promises'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

export function registerSystemHandlers(): void {
  // Return total system RAM in Gigabytes
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_RAM, () => {
    const totalBytes = totalmem()
    const totalGB = Math.round(totalBytes / (1024 * 1024 * 1024))
    return { totalGB, totalBytes }
  })

  // Fast check for active internet connection without external HTTP request
  ipcMain.handle(IPC_CHANNELS.SYSTEM_CHECK_ONLINE, async () => {
    try {
      await lookup('1.1.1.1')
      return true
    } catch {
      return false
    }
  })
}
