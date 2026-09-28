import { useEffect } from 'react'
import { useFileTreeStore } from '../stores/fileTreeStore'
import { useEditorStore } from '../stores/editorStore'

export const useFileWatcher = () => {
  const { rootPath, refreshTree } = useFileTreeStore()
  const { tabs, fileContents, updateFileContent } = useEditorStore()

  useEffect(() => {
    if (!rootPath) return

    const unsubscribe = window.kernova.onFSWatchEvent(async (event) => {
      if (['add', 'unlink', 'addDir', 'unlinkDir'].includes(event.type)) {
        await refreshTree()
      } else if (event.type === 'change') {
        const tab = tabs.find((t) => t.filePath === event.path)
        if (tab && !tab.isDirty) {
          try {
            const newContent = await window.kernova.readFile(event.path)
            if (fileContents[tab.id] !== newContent) {
              updateFileContent(tab.id, newContent)
              useEditorStore.getState().markSaved(tab.id) // Ensure it's not marked dirty by the update
            }
          } catch (error) {
            console.error('Failed to reload file:', error)
          }
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [rootPath, tabs, fileContents, refreshTree, updateFileContent])
}
