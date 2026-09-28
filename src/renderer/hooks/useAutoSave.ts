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

  useEffect(() => {
    if (!autoSave || !isDirty) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await window.kernova.writeFile(filePath, content)
        markSaved(filePath) // Using path as ID
      } catch (error) {
        console.error('AutoSave failed:', error)
      }
    }, autoSaveDelay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [content, isDirty, autoSave, autoSaveDelay, filePath, markSaved])
}
