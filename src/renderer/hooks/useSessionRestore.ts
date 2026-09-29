import { useEffect, useState } from 'react'
import { useFileTreeStore } from '../stores/fileTreeStore'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export const useSessionRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true)
  const { openFolder } = useFileTreeStore()
  const { openFile, setActiveTab, updateCursorPosition, updateScrollPosition } = useEditorStore()
  const { setSidebarWidth, toggleSidebar, isSidebarOpen } = useUIStore()

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await window.kernova.getSession()
        if (!session) return

        if (session.sidebarWidth) setSidebarWidth(session.sidebarWidth)
        if (session.sidebarOpen !== isSidebarOpen) toggleSidebar()

        if (session.openFolderPath) {
          const exists = await window.kernova?.fileExists(session.openFolderPath)
          if (exists) {
            await openFolder(session.openFolderPath)
          }
        }

        if (session.openTabs && session.openTabs.length > 0) {
          for (const tab of session.openTabs) {
            const exists = await window.kernova?.fileExists(tab.filePath)
            if (exists) {
              await openFile(tab.filePath)
              if (tab.cursorPosition) updateCursorPosition(tab.id, tab.cursorPosition)
              if (tab.scrollPosition) updateScrollPosition(tab.id, tab.scrollPosition)
            }
          }
        }

        if (session.activeTabId) {
          setActiveTab(session.activeTabId)
        }
      } catch (error) {
        console.error('Session restore failed:', error)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, []) // run once on mount

  return { isRestoring }
}
