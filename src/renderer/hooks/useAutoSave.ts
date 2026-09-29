import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'

export const useAutoSave = (
  filePath: string,
  content: string,
  isDirty: boolean,
  autoSave: boolean,
  autoSaveDelay: number
) => {
  const { markSaved } = useEditorStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestRef = useRef({ filePath, content, isDirty, autoSave })

  // Keep latest references for unmount flush
  useEffect(() => {
    latestRef.current = { filePath, content, isDirty, autoSave }
  }, [filePath, content, isDirty, autoSave])

  useEffect(() => {
    if (!autoSave || !isDirty || !filePath) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await window.kernova.writeFile(filePath, content)
        markSaved(filePath)
        timeoutRef.current = null
      } catch (error) {
        console.error('AutoSave failed:', error)
      }
    }, autoSaveDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
        // Immediately flush unsaved changes to disk on tab switch / unmount
        if (latestRef.current.isDirty && latestRef.current.autoSave && latestRef.current.filePath) {
          window.kernova
            ?.writeFile(latestRef.current.filePath, latestRef.current.content)
            .then(() => {
              markSaved(latestRef.current.filePath)
            })
            .catch((err) => console.error('AutoSave flush failed:', err))
        }
      }
    }
  }, [content, isDirty, autoSave, autoSaveDelay, filePath, markSaved])
}
