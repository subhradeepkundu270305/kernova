/**
 * Secrets IPC handlers — encrypts and stores cloud API keys using Electron safeStorage (OS Keychain).
 */
import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

const secretsStore = new Store<{ [providerId: string]: string }>({
  name: 'secrets',
  defaults: {},
})

export function registerSecretsHandlers(): void {
  // Store an encrypted key
  ipcMain.handle(
    IPC_CHANNELS.SECRETS_SET_KEY,
    (_event, { provider, key }: { provider: string; key: string }) => {
      try {
        if (safeStorage.isEncryptionAvailable()) {
          const encryptedBuffer = safeStorage.encryptString(key)
          secretsStore.set(provider, encryptedBuffer.toString('hex'))
        } else {
          // Fallback if OS keychain is unavailable
          secretsStore.set(provider, Buffer.from(key).toString('base64'))
        }
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  // Retrieve a decrypted key
  ipcMain.handle(IPC_CHANNELS.SECRETS_GET_KEY, (_event, provider: string): string | null => {
    try {
      const stored = secretsStore.get(provider)
      if (!stored) return null

      if (safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(stored, 'hex')
        return safeStorage.decryptString(buffer)
      } else {
        return Buffer.from(stored, 'base64').toString('utf-8')
      }
    } catch {
      return null
    }
  })

  // Check if a key is configured
  ipcMain.handle(IPC_CHANNELS.SECRETS_HAS_KEY, (_event, provider: string): boolean => {
    return secretsStore.has(provider)
  })

  // Delete a key
  ipcMain.handle(IPC_CHANNELS.SECRETS_DELETE_KEY, (_event, provider: string) => {
    secretsStore.delete(provider)
    return true
  })
}
