/**
 * System and Network IPC handlers
 */
import { ipcMain } from 'electron'
import { totalmem } from 'os'
import { resolve } from 'dns/promises'
import { Socket } from 'net'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

export function registerSystemHandlers(): void {
  // Return total system RAM in Gigabytes
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_RAM, () => {
    const totalBytes = totalmem()
    const totalGB = Math.round(totalBytes / (1024 * 1024 * 1024))
    return { totalGB, totalBytes }
  })

  // Reliable check for active internet connection
  ipcMain.handle(IPC_CHANNELS.SYSTEM_CHECK_ONLINE, async () => {
    // 1. Try resolving cloudflare.com via actual DNS query
    try {
      const addresses = await Promise.race([
        resolve('cloudflare.com'),
        new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 1500)
        ),
      ])
      if (addresses && addresses.length > 0) return true
    } catch {
      // Fall through to TCP socket test
    }

    // 2. Fallback: Try TCP connection to public DNS 1.1.1.1:53 with 1.5s timeout
    return new Promise<boolean>((res) => {
      const socket = new Socket()
      let finished = false
      const done = (isUp: boolean) => {
        if (!finished) {
          finished = true
          socket.destroy()
          res(isUp)
        }
      }

      socket.setTimeout(1500)
      socket.once('connect', () => done(true))
      socket.once('timeout', () => done(false))
      socket.once('error', () => done(false))

      try {
        socket.connect(53, '1.1.1.1')
      } catch {
        done(false)
      }
    })
  })
}
