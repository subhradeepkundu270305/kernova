import React, { useRef, useEffect, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { motion } from 'framer-motion'
import * as monaco from 'monaco-editor'
import { useSettingsStore } from '../../stores/settingsStore'
import { registerInlineCompletionProvider } from './inlineCompletion'
import { SELECTION_ACTIONS, triggerSelectionAction, SelectionToolbar } from '../ai/SelectionActions'
import { registerMonacoThemes } from '../../themes'

interface MonacoEditorProps {
  filePath: string
  content: string
  language: string
  onChange?: (content: string) => void
  onCursorChange?: (position: { lineNumber: number; column: number }) => void
  onScrollChange?: (position: { top: number; left: number }) => void
}

let inlineProviderRegistered = false

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  content,
  language,
  onChange,
  onCursorChange,
  onScrollChange,
}) => {
  const { editorTheme, fontSize, fontFamily, fontLigatures, minimap, wordWrap } = useSettingsStore()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean
    top: number
    left: number
    selectedText: string
  }>({ visible: false, top: 0, left: 0, selectedText: '' })

  useEffect(() => {
    if (!inlineProviderRegistered) {
      registerInlineCompletionProvider()
      inlineProviderRegistered = true
    }
  }, [])

  // Explicitly apply theme on Monaco when editorTheme changes
  useEffect(() => {
    try {
      monaco.editor.setTheme(editorTheme)
    } catch {
      // Ignore if editor not ready
    }
  }, [editorTheme])

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor
    registerMonacoThemes(monacoInstance)
    monacoInstance.editor.setTheme(editorTheme)

    editor.onDidChangeModelContent(() => {
      onChange?.(editor.getValue())
    })

    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({ lineNumber: e.position.lineNumber, column: e.position.column })
    })

    editor.onDidScrollChange((e) => {
      onScrollChange?.({ top: e.scrollTop, left: e.scrollLeft })
      updateSelectionPopup()
    })

    // Listen to selection changes to display floating action toolbar
    const updateSelectionPopup = () => {
      const selection = editor.getSelection()
      if (selection && !selection.isEmpty()) {
        const text = editor.getModel()?.getValueInRange(selection) || ''
        if (text.trim().length > 0) {
          const startPos = selection.getStartPosition()
          const coords = editor.getScrolledVisiblePosition(startPos)
          if (coords) {
            setSelectionPopup({
              visible: true,
              top: Math.max(8, coords.top - 44),
              left: Math.max(16, coords.left),
              selectedText: text,
            })
            return
          }
        }
      }
      setSelectionPopup((prev) => (prev.visible ? { ...prev, visible: false } : prev))
    }

    editor.onDidChangeCursorSelection(updateSelectionPopup)

    // Register selection actions into Monaco's right-click context menu
    for (const action of SELECTION_ACTIONS) {
      editor.addAction({
        id: `kernova-action-${action.id}`,
        label: `AI: ${action.label}`,
        contextMenuGroupId: '0_kernova_ai',
        contextMenuOrder: 1,
        run: (ed) => {
          let selectedText = ''
          const selection = ed.getSelection()
          if (selection && !selection.isEmpty()) {
            selectedText = ed.getModel()?.getValueInRange(selection) || ''
          }
          if (!selectedText.trim()) {
            const pos = ed.getPosition()
            if (pos) {
              const lineContent = ed.getModel()?.getLineContent(pos.lineNumber)
              selectedText = lineContent || ''
            }
          }
          if (selectedText.trim()) {
            triggerSelectionAction(action.id, selectedText)
          }
        },
      })
    }
  }

  // Update content if changed externally
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== content) {
        editorRef.current.setValue(content)
      }
    }
  }, [content])

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={editorTheme}
        value={content}
        path={filePath}
        beforeMount={registerMonacoThemes}
        onMount={handleEditorMount}
        loading={
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-[#2A2A3A] border-t-[#8B5CF6]"
            />
          </div>
        }
        options={{
          fontSize,
          fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`,
          fontLigatures,
          minimap: { enabled: minimap },
          wordWrap,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 16 },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          inlineSuggest: {
            enabled: true,
            mode: 'subsequent',
          },
        }}
      />

      {/* Floating Selection Action Toolbar */}
      <SelectionToolbar
        visible={selectionPopup.visible}
        top={selectionPopup.top}
        left={selectionPopup.left}
        selectedText={selectionPopup.selectedText}
        onClose={() =>
          setSelectionPopup({ visible: false, top: 0, left: 0, selectedText: '' })
        }
      />
    </div>
  )
}
