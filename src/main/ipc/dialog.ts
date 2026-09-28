/**
 * Dialog IPC handlers — native OS dialog wrappers.
 */
import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

/** Register all dialog IPC handlers */
export function registerDialogHandlers(): void {
  // Open folder dialog — returns selected folder path or null
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FOLDER, async () => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: 'Open Folder',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Open file dialog — returns selected file paths or null
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async () => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', 'multiSelections'],
      title: 'Open File',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths
  })

  // Save file dialog — returns selected save path or null
  ipcMain.handle(IPC_CHANNELS.DIALOG_SAVE_FILE, async (_event, defaultPath?: string) => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showSaveDialog(win!, {
      title: 'Save File',
      defaultPath: defaultPath || undefined,
    })
    if (result.canceled || !result.filePath) return null
    return result.filePath
  })

  // Message box — returns the index of the clicked button
  ipcMain.handle(
    IPC_CHANNELS.DIALOG_MESSAGE_BOX,
    async (
      _event,
      options: { type: string; title: string; message: string; buttons: string[] }
    ) => {
      const win = BrowserWindow.getFocusedWindow()
      const result = await dialog.showMessageBox(win!, {
        type: options.type as 'none' | 'info' | 'error' | 'question' | 'warning',
        title: options.title,
        message: options.message,
        buttons: options.buttons,
      })
      return result.response
    }
  )
}
